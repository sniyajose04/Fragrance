const express = require('express')
const admin_route = express();
const adminController = require('../controllers/adminController')
const productController = require('../controllers/productController')
const categoryController = require('../controllers/categoryController')
const orderController = require('../controllers/orderController')
const couponController = require('../controllers/couponController')
const offerController = require('../controllers/offerController')
const upload=require('../config/multer')

admin_route.set('views','./views/admin');

const isLogout = require("../middleware/adminauth")

//ADMIN
admin_route.get('/adminpanel',isLogout,adminController.adminDashboard );
admin_route.get('/',adminController.adminlogin);
admin_route.get('/adminLogout',adminController.adminLogout);
admin_route.post('/',adminController.verifyadmin);
admin_route.get('/categorylist',isLogout,categoryController.categoryDetail)
admin_route.get('/Userlist',isLogout,adminController.userDetail)
admin_route.patch('/userBlock/:id',adminController.userBlock)
admin_route.patch('/userUnblock/:id',adminController.userUnblock)
admin_route.get('/salesReport',isLogout,adminController.salesReport)
admin_route.post('/dateFilter',isLogout,adminController.dateFilter)

//PRODUCT
admin_route.get('/product',isLogout,productController.productDetail);
admin_route.get('/productAdd',isLogout,productController.addProductpage)
admin_route.post('/productAdd',upload.uploadProduct,productController.addproduct)
admin_route.get('/editProduct/:id',isLogout, productController.editProductPage);
admin_route.post('/updateproduct',productController.updateProduct)
admin_route.patch('/publish/:id',productController.publish)
admin_route.patch('/unpublish/:id',productController.unpublish)

//CATEGORY
admin_route.get('/categorylist',isLogout,categoryController.categoryDetail)
admin_route.get('/addcategory',isLogout,categoryController.addCategoryPage)
admin_route.post('/addcategory',categoryController.addcategory)
admin_route.get('/editCategory/:id',isLogout,categoryController.editCategoryPage)
admin_route.post('/updateCategory',categoryController.updateCategory)
admin_route.patch('/list/:id',categoryController.list)
admin_route.patch('/Unlist/:id',categoryController.Unlist)


//ORDER
admin_route.get('/orderlist',isLogout,orderController.orderList)
admin_route.get('/orderDetail',isLogout,orderController.orderDetail)
admin_route.post('/orderdetailchange',isLogout,orderController.orderDetailChange)


//coupon
admin_route.get('/couponList',isLogout,couponController.couponList)
admin_route.post('/couponList',isLogout,couponController.addCoupons)
admin_route.delete('/deleteCoupon',isLogout,couponController.deleteCoupon)



//offer
admin_route.get('/offerList',isLogout,offerController.offerList)
admin_route.post('/offerList',isLogout,offerController.addOffers)
admin_route.delete('/deleteOffer',isLogout,offerController.deleteOffer)

module.exports = admin_route