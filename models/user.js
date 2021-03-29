const mongoose=require("mongoose");
const passportlocalmongoose=require("passport-local-mongoose");
const Schema=mongoose.Schema;
const User=new Schema({
    username:String,
    password:String
});
User.plugin(passportlocalmongoose);
module.exports=mongoose.model('User',User);