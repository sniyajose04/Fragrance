const express = require("express")
const user_route =express();
const usercontroller = require("../controllers/userController");
const productController = require("../controllers/productController")
const cartController = require("../controllers/cartController")
const profileController = require("../controllers/profileController")
const checkoutController = require("../controllers/checkoutController")
const productdetailController = require("../controllers/productdetailController")
const shopController = require("../controllers/shopController")
const wishlistController = require("../controllers/wishlistController")
const offerController = require("../controllers/offerController")

const { isLogin,isLogout,blockeduser} = require("../middleware/auth")


user_route.set('views','./views/user');

user_route.get('/',blockeduser,usercontroller.renderhome)
user_route.get('/register',isLogout,usercontroller.loadregister);
user_route.post('/register',isLogout,usercontroller.insertUser);
user_route.get('/login',isLogout,usercontroller.loginLoad);
user_route.post('/login',isLogout,usercontroller.verifyLogin);
user_route.get('/userLogout',usercontroller.userLogout);
user_route.post('/verifyOtp',isLogout,usercontroller.verifyotp);
user_route.get('/forgotPassword',isLogout,usercontroller.renderforgotpasswordpage);
user_route.get('/emailverify',isLogout,usercontroller.emailverify);
user_route.get('/otpVerify',isLogout,usercontroller.otpVerify );
user_route.post('/password',isLogout,usercontroller.newPasswordPage );
user_route.post('/password',isLogout,usercontroller.updatePassword );
user_route.get('/contact',isLogin,usercontroller.contactPage);
user_route.get('/about',isLogout,usercontroller.aboutPage);


user_route.get('/productview',isLogout,productController.productView)


user_route.get('/cart',isLogin,cartController.cartPage)
user_route.get('/removeFromCart',isLogin, cartController.removeFromCart);
user_route.post('/updatequantity',isLogin, cartController.updateQuantity);


user_route.get('/userDetail',isLogin,profileController.userDetailPage)
user_route.post('/userDetail',isLogin,profileController.userPassword)
user_route.post('/saveAddress',isLogin,profileController.saveAddress)
// user_route.get('/editaddress',isLogin,profileController.editAddress)
user_route.get('/orderdetail',isLogin,profileController.orderDetailPage)
user_route.post('/ordercancel',isLogin,profileController.orderCancel)




user_route.get('/checkOut',isLogin,checkoutController.checkOutPage)
user_route.post('/placeOrder',isLogin,checkoutController.placeOrder)
user_route.post('/onlineplaceorder',isLogin,checkoutController.onlinePlaceOrder)
user_route.post('/onlinepaymentfailedd',isLogin,checkoutController.onlinePaymentFailed)
user_route.post('/verifypayment',isLogin,checkoutController.verifyRazorpayPayment)
user_route.get('/repayment',isLogin,checkoutController.repaymentPage)
user_route.get('/orderSuccess',isLogin,checkoutController.orderSuccess)
user_route.post('/applycoupon',isLogin,checkoutController.applyCoupon)
user_route.post('/checkoutsaveaddress',isLogin,checkoutController.checkoutSaveAddress)


user_route.get('/productDetail',isLogin,productdetailController.productDetail )
user_route.post('/addToCart',isLogin,productdetailController.addToCart )
user_route.post('/addWishlist',isLogin,productdetailController.addWishlist )


user_route.get('/shop',isLogin,shopController.shopPage)
user_route.post('/searchproduct',isLogin,shopController.searchData)


user_route.get('/wishlist',isLogin,wishlistController.wishlistPage)
// user_route.get('/removeWishlistProduct',isLogin,wishlistController.removeWishlistProduct)
user_route.post('/addtoCartFromWishlist',isLogin,wishlistController.addtoCartFromWishlist)


module.exports = user_route