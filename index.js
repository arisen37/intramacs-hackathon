const express = require('express');
const { userRouter } = require('./routers/user');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser'); // Make sure to use this

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser()); // Use cookie-parser middleware

// API Routes
app.use('/api/v1/user', userRouter);

// "Smart" Root Route
app.get('/', (req, res) => {
    // FIXED: Check for the token in req.cookies, not req.headers
    const token = req.cookies.token;

    if (!token) {
        return res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET);
        // Token is valid, serve the chat page
        res.sendFile(path.join(__dirname, 'public', 'chatpage.html'));
    } catch (error) {
        // Token is invalid, clear the bad cookie and serve the login page
        res.clearCookie('token');
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// Serve other static files like CSS from the 'public' directory
app.use(express.static('public'));

app.listen(3000, () => {
    console.log("Server listening on port 3000");
});

module.exports = app;