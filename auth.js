jwt = require('jsonwebtoken');
require('dotenv').config();
JWT_SECRET = process.env.JWT_SECRET;

function authentication(){
    const token = req.headers.token;
    const decodedInfo = jwt.verify(token , JWT_SECRET);

    if(!decodedInfo){
        res.status(401).json({
            message : "Unauthorized"
        })
    }
    else{

        req.headers.username = decodedInfo;
        res.status(200).json({
            message : "Successfully authenticated"
        })
    }
}

module.exports ={
    auth : authentication
}