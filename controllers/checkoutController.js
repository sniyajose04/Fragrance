const Order = require('../models/orderModel')
const Product = require('../models/productModel');
const Category = require('../models/categoryModel')
const User = require('../models/userModels')
const Address = require('../models/addressModel')
const Cart = require('../models/cartModel')
const { orderIdGenerate } = require('../helpers/orderGenerator')
const Razorpay=require('razorpay')
const crypto = require('crypto')
require('dotenv').config()
const Coupon = require('../models/couponModel');

var instance = new Razorpay({
    key_id: process.env.KEYID,
    key_secret: process.env.KEYSECRET,
  });

const checkOutPage = async (req, res) => {
    try {
        const userId = req.session.user_id;

        const userData = await User.findById(userId)

        const addressData = await Address.find({ userId: userId })

        const cartData = await Cart.findOne({ userId: userId }).populate("products.productId")

        const coupon = await Coupon.findOne()


        if (!cartData) {
            console.log('No cart data found for user:', userId);
            return res.status(404).send('No cart data found');
        }

        res.render('checkOut', { userData, addressData, cartData,coupon });

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}

const placeorder = async (req, res) => {
    try {
        const userId = req.session.user_id;
        console.log('userId:', userId);

        const { addressId, totalAmount, paymentMethod } = req.body;
        console.log(req.body);

      
        const userCart = await Cart.findOne({ userId: userId }).populate('products.productId');

        if (!userCart || !userCart.products.length) {
            console.error("Cart is empty.");
            return res.status(404).json({ error: "Cart is empty" });
        }

        const orderProducts = userCart.products.map(productItem => ({
            productId: productItem.productId._id,
            quantity: productItem.quantity,
        }));

        console.log('orderProducts:', orderProducts);

        const order = new Order({
            orderId: orderIdGenerate(),
            userId: userId,
            address: addressId, 
            totalAmount: totalAmount,
            paymentMethod: paymentMethod,
            products: orderProducts,
        });
        console.log('order:', order)

    
        order.paymentMethod = "cash on delivery";
        order.paymentStatus = "Pending";

      
        await order.save();

        for (i=0;i<userCart.products.length;i++) {
            let item = userCart.products[i];
            const product = await Product.findById(item.productId);
         
            product.Stock-= item.quantity;
     
            await product.save();
        }
    
            const result = await Cart.updateOne(
                {userId:userId},
                {
                  $unset: {
                    products: 1,
                  },
                }
              );
     
       
        if (result.updated === 0) {
            console.error("Failed to update cart.");
        }

        res.status(200).json({ message: "Order placed successfully" });



    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


const onlinePlaceOrder = async (req, res) => {
    try {
        const userId = req.session.user_id;
        console.log('userId:', userId);

        const { addressId, totalAmount, paymentMethod } = req.body;
        console.log(req.body);

        const userCart = await Cart.findOne({ userId: userId }).populate('products.productId');

        if (!userCart || !userCart.products.length) {
            console.error("Cart is empty.");
            return res.status(404).json({ error: "Cart is empty" });
        }

        const orderProducts = userCart.products.map(productItem => ({
            productId: productItem.productId._id,
            quantity: productItem.quantity,
        }));

        console.log('orderProducts:', orderProducts);

        const orderId = orderIdGenerate(); 

        const order = new Order({
            orderId: orderId,
            userId: userId,
            address: addressId,
            totalAmount: totalAmount,
            paymentMethod: paymentMethod,
            products: orderProducts,
           
            paymentStatus: "Success",
        });
        console.log('order:', order);

        await order.save();


        for (i=0;i<userCart.products.length;i++) {
            let item = userCart.products[i];
            const product = await Product.findById(item.productId);
         
            product.Stock-= item.quantity;
     
            await product.save();
        }
    
            const result = await Cart.updateOne(
                {userId:userId},
                {
                  $unset: {
                    products: 1,
                  },
                }
              );

        const options = {
            amount: totalAmount * 100,
            currency: 'INR',
            receipt: order.orderId,
        };
console.log('option:',options);
        instance.orders.create(options, async function (err, razorpayOrder) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Failed to create Razorpay order" });
            } else {
             
                res.json({ payment: false, method: "UPI", razorpayOrder: razorpayOrder, order: orderId});
            }
            console.log('razorpayOrder :',razorpayOrder);
            console.log('order ID :',orderId)
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const onlinePaymentFailed = async(req,res)=>{
    try {
        let order = req.body.order;
     console.og('failedOrder',order)
        const orderData = await Order.findById(order);
       
        orderData.orderStatus="Payment Pending";
        orderData.paymentStatus="Payment Failed";
        orderData.save();
        res.status(200).json({})
      
        
    } catch (error) {
        
    }
}


const verifyRazorpayPayment = async(req,res)=>{
    try {
        const { order, payment } = req.body;
       
        
        res.status(200).json({ status: true,  })
        let hmac = crypto.createHmac("sha256", YOUR_KEY_SECRET);
        hmac.update(
            `${payment.razorpay_order_id}|${payment.razorpay_payment_id}`
        );
        hmac = hmac.digest("hex");
        if (hmac === payment.razorpay_signature) {
            
            res.status(200).json({ status: true,  })
           

        } else {
           
            res.json({ status: false })
        }
    } catch (error) {
        
    }
}


const orderSuccess = async(req,res)=>{
    try {
        res.render('orderSuccess')
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" }); 
    }
}


const applyCoupon = async (req, res) => {
    try {
        const { user_id } = req.session;
    

        const totalAmount = req.body.totalAmount;
        console.log('totalAmount',totalAmount)
        const code = req.body.code;
        console.log('code',code)

        const coupon = await Coupon.findOne({ name: code });
        console.log('coupon',coupon)

        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }

        if (coupon.usedByUsers.includes(user_id)) {
            return res.status(400).json({ success: false, message: "Coupon already used" });
        }

        const currentDate = new Date();
        if (currentDate < new Date(coupon.start) || currentDate > new Date(coupon.end)) {
            return res.status(400).json({ success: false, message: 'Coupon expired' });
        }

        if (totalAmount < coupon.minpurchaseamount) {
            return res.status(400).json({ success: false, message: "Minimum purchase amount not reached" });
        }

        const discountedAmount = Number(totalAmount) - Number(coupon.discount);
        const couponDiscount = coupon.discount;

        coupon.usedByUsers.push(user_id);
        await coupon.save();

        return res.status(200).json({ success: true, totalAmount: discountedAmount, discount: couponDiscount });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}


module.exports = {
    checkOutPage,
    placeorder,
    onlinePlaceOrder,
    onlinePaymentFailed,
    verifyRazorpayPayment,
    orderSuccess,
    applyCoupon
}