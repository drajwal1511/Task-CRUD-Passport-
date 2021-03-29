const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Task=new Schema({
    title:String,
    desc:String,
    due:String,
});
module.exports=mongoose.model('Task',Task);