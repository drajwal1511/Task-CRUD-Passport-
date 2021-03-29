const express=require('express');
var flash = require("connect-flash");
var seedDB=require("./seed")
require('dotenv').config()
// MODELS
var User= require("./models/user");
var Task=require("./models/task");
const app=express();
// middleware
var middleware=require("./middleware/index");
// methodoverride
var methodOverride = require("method-override");
app.use(methodOverride("_method"))
// Using EJS
app.set("view engine","ejs");
// Using Public Directory
app.use(express.static("public"));
// Using body parser
// var bodyParser=require('body-parser');
app.use(express.urlencoded({extended:true}));
app.use(express.json());
// using mongoose
const mongoose = require('mongoose');
mongoose.connect(process.env.DBURL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
});

// passport
var passport=require("passport");
var LocalStrategy=require("passport-local");
var passportlocalmongoose=require("passport-local-mongoose");
// seedDB();
var session=require("express-session");
const { isloggedin } = require('./middleware/index');
app.use(session({
    secret:"asdfasdf",
    resave:false,
    saveUninitialized:true,
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// Sending currentUser in each route
app.use((req,res,next)=>{
    res.locals.curuser=req.user;
    res.locals.error=req.flash("error");
    res.locals.success=req.flash("success");
    // if(req.user){
    //     console.log(req.user.username);
    // }
    next();
})
app.get("/",(req,res)=>{
    res.render("home");
})
app.get("/register",(req,res)=>{
    res.render("register");
})
app.post("/register",(req,res)=>{
    User.register(new User({username:req.body.username}),req.body.password,function(err,user){
        if(err){
            console.log(err.message);
            req.flash("error",err.message);
            res.render("register",{curuser:req.user});
        }
        else{
            console.log("User added");
            req.flash("success","Welcome "+user.username);
            passport.authenticate("local")(req,res,function(){
                res.redirect("/tasks");
            })
        }
    })
})
app.get("/login",(req,res)=>{
    res.render("login");
})
app.post("/login",passport.authenticate("local",{failureFlash:true,failureFlash:'Invalid Username or password',failureRedirect:'/login'}),function(req,res){
    console.log("User login successfull");
    req.flash("success","Hello There");
    res.redirect("/tasks");
})
app.get("/logout",(req,res)=>{
    req.logout();
    req.flash("success","Logged you out");
    res.redirect("/");
})
app.get("/tasks",middleware.isloggedin,(req,res)=>{
    Task.find({},function(err,restask){
        if(err){
            console.log(err);
            res.redirect("/");
        }else{
            res.render("tasks",{tasks:restask});
        }
    })
})
// create
app.get("/tasks/new",middleware.isloggedin,function(req,res){
    res.render("newtask");
})
app.post("/tasks",middleware.isloggedin,function(req,res){
    var data={
        title:req.body.title,
        desc:req.body.desc,
        due:req.body.due,
    }
    var newtask=new Task(data);
    newtask.save(function(err,task){
        if(err){
            console.log(err);
            req.flash("error","Can't add a task");
            res.redirect("/tasks");
        }else{
            console.log("added new task");
            req.flash("success","Added new task");
            res.redirect("/tasks");
        }
    })
})
// read
app.get("/tasks/:id",middleware.isloggedin,(req,res)=>{
    Task.findById(req.params.id).exec(function(err,task){
        if(err){
            console.log(err);
            res.redirect("/tasks");
        }else{
            res.render("onetask",{task:task});
        }
    })
})
// update
app.get("/tasks/:id/edit",middleware.isloggedin,function(req,res){
    Task.findById(req.params.id,function(err,task){
        if(err){
            console.log(err);
            req.flash("error","Can't find task");
            res.redirect("/tasks");
        }else{
            res.render("taskedit",{task:task});
        }
    })
})
app.put("/tasks/:id",middleware.isloggedin,function(req,res){
    var data={
        title:req.body.title,
        desc:req.body.desc,
        due:req.body.due
    }
    Task.findByIdAndUpdate(req.params.id,data,function(err,raw){
        if(err){
            console.log(err);
            req.flash("error","can't update task");
            res.redirect("/tasks");
        }else{
            req.flash("success","Task updated");
            res.redirect("/tasks/"+req.params.id);
        }
    })
})
// delete
app.delete("/tasks/:id",middleware.isloggedin,(req,res)=>{
    Task.findByIdAndDelete(req.params.id,function(err,raw){
        if(err){
            console.log(err);
            req.flash("error","Can't delete task");
        }else{
            req.flash("success","Task deleted");
            console.log("Removed Task");
        }
        res.redirect("/tasks");
    })
})
app.listen(3000,process.env.IP,()=>{
    console.log("Server UP");
})