const mongoose= require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/FraGraCe");
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const session = require("express-session");
const path=require('path')
const nocache = require('nocache');

const config = require("./config/config");
app.set('view engine','ejs');
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
// app.use(session({secret:config.sessionSecret}));

app.use(nocache());
app.use(
    session({
      secret: "secret key",
      resave: false,
      saveUninitialized: true,
    }))
//for user route
const userRoute = require('./routes/userRoute');
app.use('/',userRoute);

//for admin route
const adminRoute = require('./routes/adminRoute');
app.use('/admin',adminRoute);

app.use(express.static('uploads'));


const port =process.env.port|| 3001;
app.listen(port,()=>{
    console.log("server is running...http://localhost:3001");
});