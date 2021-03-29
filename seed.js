var mongoose=require("mongoose");
var Task=require("./models/task");
var User=require("./models/user");
data=[
    {title:"Demo Task",
    desc:"To complete this website",
    due:"2021-03-09"
},
    {title:"Demo Task 2",
    desc:"To Get Internship in Oyesters",
    due:"2021-03-09"
}
]
function seedDB(){
    User.remove({},function(err){
        if(err){
            console.log(err);
        }else{
            console.log("removed all users");
        }
    })
    Task.remove({},function(err){
        if(err){
            console.log("err");
        }else{
            console.log("removed all tasks");
            data.forEach(function(seed){
                Task.create(seed,function(err,campground){
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log("Added a new Task");
                    }
                })
            })
        }
    })
}
module.exports=seedDB;