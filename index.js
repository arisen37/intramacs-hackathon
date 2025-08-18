// index.js (Corrected)
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { userRouter } = require('./routers/user');
const { auth } = require('./auth'); // Import the auth middleware
require('dotenv').config();

const app = express();

app.use(express.json())

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(cookieParser()); // Use cookie-parser to read cookies

// --- API Routes ---
app.use('/api/v1/user', userRouter);

// --- PROTECTED ROUTE for the chat page ---
// The 'auth' middleware runs FIRST. If it fails, the user is redirected.
// If it succeeds, the chat page is served.
app.get('/chatpage.html', auth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chatpage.html'));
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// For local development
app.listen(3000, () => {
    console.log("Server running on port 3000");
});

module.exports = app;