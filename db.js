const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL)

const { z } = require('zod')
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const UserSchema = Schema({
    username : {type : z.string , unique : true},
    email : {type : z.email , unique : true},
    password : {type : z.string.min(8)},

    //Emotions Current Day0
    Day0_0 : {type : Number},
    Day0_1 : {type : Number},
    Day0_2 : {type : Number},
    Day0_3 : {type : Number},
    Day0_4 : {type : Number},
    Day0_5 : {type : Number},

    //Emotions Current Day1
    Day1_1 : {type : Number},
    Day1_1 : {type : Number},
    Day1_2 : {type : Number},
    Day1_3 : {type : Number},
    Day1_4 : {type : Number},
    Day1_5 : {type : Number},

    //Emotions Current Day2
    Day2_0 : {type : Number},
    Day2_1 : {type : Number},
    Day2_2 : {type : Number},
    Day2_3 : {type : Number},
    Day2_4 : {type : Number},
    Day2_5 : {type : Number},

    //Emotions Current Day3
    Day3_0 : {type : Number},
    Day3_1 : {type : Number},
    Day3_2 : {type : Number},
    Day3_3 : {type : Number},
    Day3_4 : {type : Number},
    Day3_5 : {type : Number},


    //Emotions Current Day4
    Day4_0 : {type : Number},
    Day4_1 : {type : Number},
    Day4_2 : {type : Number},
    Day4_3 : {type : Number},
    Day4_4 : {type : Number},
    Day4_5 : {type : Number},
})

const UserModel = mongoose.model("user" , UserSchema)

module.exports({
    UserModel : UserModel
})