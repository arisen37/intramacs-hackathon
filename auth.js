const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    // 1. Get the token from the request cookies
    const token = req.cookies.token;

    // 2. If no token exists, send an Unauthorized error
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        // 3. Verify the token
        const decodedUserInfo = jwt.verify(token, JWT_SECRET);
        
        // 4. Attach the decoded user info to the request object for later use
        req.user = decodedUserInfo; 
        
        // 5. Proceed to the next middleware or route handler
        next(); 
    } catch (error) {
        // 6. If the token is invalid or expired, send a Forbidden error
        return res.status(403).json({ message: "Invalid or expired token." });
    }
}

module.exports = {
    auth: authenticateToken
};