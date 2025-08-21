const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { userRouter } = require('./routers/user');
const { auth } = require('./auth');
require('dotenv').config();


const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/api/v1/user', userRouter);

app.get('/chatpage', auth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chatpage.html'));
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

module.exports = app;