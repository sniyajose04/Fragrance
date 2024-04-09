const express = require("express")
const user_route =express();
const usercontroller = require("../controllers/userController");
const productController = require("../controllers/productController")

const { isLogin,isLogout,blockeduser} = require("../middleware/auth")



user_route.set('views','./views/user');

user_route.get('/',blockeduser,usercontroller.renderhome)
user_route.get('/register',isLogout,usercontroller.loadregister);
user_route.post('/register',isLogout,usercontroller.insertUser);
user_route.get('/login',isLogout,usercontroller.loginLoad);
user_route.post('/login',isLogout,usercontroller.verifyLogin);
user_route.get('/userLogout',usercontroller.userLogout);
user_route.post('/verifyOtp',isLogout,usercontroller.verifyotp)
user_route.get('/forgotPassword',isLogout,usercontroller.renderforgotpasswordpage)
user_route.get('/emailverify',isLogout,usercontroller.emailverify)
user_route.get('/otpVerify',isLogout,usercontroller.otpVerify )
user_route.get('/password',isLogout,usercontroller.newPasswordPage )
user_route.post('/password',isLogout,usercontroller.updatePassword )



user_route.get('/productview',isLogout,productController.productView)




module.exports = user_route