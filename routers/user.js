const { Router } = require('express');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const { UserModel } = require('../db');
const userRouter = Router();
const cors = require('cors');
const { default: z } = require('zod');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

userRouter.use(cors());

const otpStore = {};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

userRouter.post('/send-otp', async (req, res) => {
    const emailSchema = z.string().email();
    const parsedResult = emailSchema.safeParse(req.body.email);
    if (!parsedResult.success) {
        return res.status(400).json({ error: "Invalid email format." });
    }
    
    const email = parsedResult.data;
    const userExists = await UserModel.findOne({ email: email });
    if (userExists) {
        return res.status(409).json({ error: "Email is already registered." });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiration = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore[email] = { otp, expiration };

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Verification Code',
        text: `Your OTP is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to send OTP.' });
        }
        res.status(200).json({ message: 'OTP sent to your email.' });
    });
});


userRouter.post('/signup', async (req, res) => {
    const inputSchema = z.object({
        email: z.string().email(),
        username: z.string().min(3).max(100),
        password: z.string().min(8).max(100),
        otp: z.string().length(6)
    });

    const parsedSuccess = inputSchema.safeParse(req.body);

    if (!parsedSuccess.success) {
        return res.status(400).json({
            error: "Invalid input format."
        });
    }

    const { username, email, password, otp } = req.body;
    
    const storedData = otpStore[email];
    if (!storedData) {
        return res.status(400).json({ error: "Invalid or expired OTP. Please try again." });
    }
    if (Date.now() > storedData.expiration) {
        delete otpStore[email];
        return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }
    if (storedData.otp !== otp) {
        return res.status(400).json({ error: "Invalid OTP." });
    }

    try {
        const hashedPass = await bcrypt.hash(password, 10);
        const newUser = new UserModel({
            email,
            username,
            password: hashedPass
        });

        await newUser.save();
        delete otpStore[email];
        
        res.status(200).json({
            ok: true
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: "Username or email already exists." });
        }
        return res.status(500).json({ error: "Internal server error." });
    }
});

userRouter.post('/signin', async (req, res) => {
    if (req.headers.token) {
        try {
            jwt.verify(req.headers.token, JWT_SECRET);
            return res.json({ ok: true, message: "Token is valid." });
        } catch (e) {
            return res.status(401).json({ error: "Invalid or expired token." });
        }
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: "Email and password are required."
        });
    }

    try {
        const user = await UserModel.findOne({ email: email });

        if (!user) {
            return res.status(401).json({ error: "Invalid login credentials." });
        }

        bcrypt.compare(password, user.password, function (err, result) {
            if (err || !result) {
                return res.status(401).json({
                    error: "Invalid login credentials."
                });
            }

            if (result) {
                const payload = { userId: user._id, username: user.username };
                const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

                return res.status(200).json({
                    message: "Sign in successful.",
                    token: token
                });
            }
        });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = {
    userRouter
};