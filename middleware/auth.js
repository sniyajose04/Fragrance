const User = require('../models/userModels')

const isLogin = async(req,res,next)=>{
    try {
        console.log('userId',req.session.user_id);
        if(req.session.user_id){
          next()
        }else {
           return res.redirect('/');
        }
        
    } catch (error) {
        console.log(error)
    }
}


const isLogout = async(req,res,next)=>{
    try {
        if(req.session.user_id){
          return  res.redirect('/')
        }
        next();
    } catch (error) {
        console.log(error)
    }
}


const blockeduser = async(req,res,next)=>{
    try {
        if(req.session.user_id){
         const userData= await  User.findOne({_id:req.session.user_id});
         if(userData.is_blocked){
              return res.redirect('/userLogout');
         }
         return next(); 
        }
         next();
    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    isLogin,
    isLogout,
    blockeduser
}