const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.DATABASE_URL)

const { z } = require('zod')
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const UserSchema = Schema({
    username : {type : String , unique : true},
    email : {type : String , unique : true},
    password : {type : String},

    //Emotions Current Day0
    Day0_0 : {type : Number},
    Day0_1 : {type : Number},
    Day0_2 : {type : Number},
    Day0_3 : {type : Number},
    Day0_4 : {type : Number},
    Day0_5 : {type : Number},
})

const signupSchema = z.object({
    username: z.string({ required_error: "Username is required" }).min(3),
    email: z.string({ required_error: "Email is required" }).email(),
    password: z.string({ required_error: "Password is required" }).min(8, "Password must be at least 8 characters long"),
});

const UserModel = mongoose.model("user" , UserSchema)

module.exports= {
    UserModel : UserModel
}