jwt = require('jsonwebtoken');
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
        res.status(200).json({
            message : "Successfully authenticated"
        })

        req.headers.username = decodedInfo;
    }
}

module.exports({
    auth : authentication
})