const { Router } = require('express');
const { auth } = require('../auth');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const { UserModel } = require('../db');
const userRouter = Router();
const cors = require('cors');
const { default: z } = require('zod');
const bcrypt = require('bcrypt');
const path = require('path');

userRouter.use(cors());

userRouter.post('/signup', async (req, res) => {
    const inputSchema = z.object({
        email: z.string().email(),
        username: z.string().min(3).max(100),
        password: z.string().min(8).max(100)
    });

    const parsedSuccess = inputSchema.safeParse(req.body);

    if (!parsedSuccess.success) {
        return res.status(409).json({
            error: "Invalid input format."
        });
    }

    const { username, email, password } = req.body;

    try {
        const hashedPass = await bcrypt.hash(password, 10);
        const newUser = new UserModel({
            email: email,
            username: username,
            password: hashedPass
        });

        await newUser.save();
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