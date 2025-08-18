const { Router } = require('express')
const { auth } = require('./routers/auth')
const {UserModel} = require('./db.js')
const userRouter = Router();

JWT_SECRET = process.env.JWT_SECRET

userRouter.post('/signup' , (req , res)=>{
    const username = req.body.username
    const email = req.body.email
    const password = req.boy.password

    bcrypt.hash(password , 10 , async function(err , data){
        const Newuser = new UserModel({
            email : email,
            username : username,
            password : data
        })

        try{
            await Newuser.save()
            res.status(200)
        }catch{
            res.status(400).json({
                message : 'error'
            })
        }     
    })
})

userRouter.post('/signin'  , (req , res)=>{
    const username = req.body.username 
    const password = req.body.password

    if(!username){
        res.status(401).json({
            msg : "error"
        })
    }else{
        const token = jwt.sign(username , JWT_SECRET)
        
        const user = UserModel.find({username : username})

        bcrypt.compare(password , user.password , function(err , data){
            if(result){
                res.status(200).json({
                    token
                })
            }else{
                res.status(401).json({
                    msg : "invalid credentials"
                })
            }
        })
    }    
})

module.exports({
    userRouter
})