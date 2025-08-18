const { Router } = require('express')
const { auth } = require('../auth')
require('dotenv').config();
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET
const { UserModel } = require('../db')
const userRouter = Router();
const cors = require('cors');
const { default: z, ZodAny } = require('zod');
const bcrypt = require('bcrypt')
const path = require('path');

userRouter.use(cors())


userRouter.post('/signup', async (req, res) => {

    const inputSchema = z.object({
        email: z.email(),
        username: z.string().min(3).max(100),
        password: z.string().min(8).max(100)
    })

    const parsedSuccess = inputSchema.safeParse(req.body)

    if (!parsedSuccess.success) {
        res.status(409).json({
            error: parsedSuccess.error
        })
    }

    else {

        const username = req.body.username
        const email = req.body.email
        const password = req.body.password


        try {
            hashedPass = await bcrypt.hash(password, 10)
            const Newuser = new UserModel({
                email: email,
                username: username,
                password: hashedPass
            })

            await Newuser.save()
            res.status(200).json({
                ok: true
            })

        }
        catch {
            if (error.code === 11000) {
                return res.status(409).json({ message: "Username or email already exists." });
            }
            return res.status(500).json({ message: "Internal server error." });
        }

    }
})

userRouter.post('/signin', async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    if (!email) {
        res.status(200).json({
            error: "username not found"
        })
    } else {
        const token = jwt.sign(email, JWT_SECRET)

        const user = await UserModel.findOne({ email: email })

        bcrypt.compare(password, user.password, function (err, data) {
            if (err) {
                res.status(401).json({
                    msg: "invalid credentials"
                })
            } else {
                 // In routers/user.js inside the signin success block

                // Send the token as a secure, httpOnly cookie
                return res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
                    sameSite: 'strict'
                }).status(200).json({
                    message: "Sign in successful."
                });                                  
            }
        })
    }
})

module.exports = {
    userRouter
}