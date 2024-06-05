const Order = require('../models/orderModel')
const Product = require('../models/productModel');
const User = require('../models/userModels')
const Address = require('../models/addressModel')
const Cart = require('../models/cartModel')
const { orderIdGenerate } = require('../helpers/orderGenerator')
const Razorpay = require('razorpay')
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
        res.render('checkOut', { userData, addressData, cartData, coupon });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}

const placeOrder = async (req, res) => {
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
        console.log('order:', order);
        if (paymentMethod === 'cash on delivery') {
            if (totalAmount > 1000) {
                console.log("COD is not possible on orders above 1000");
                return res.json({ message: "COD is not possible on orders above 1000" });
            } else {
                order.paymentStatus = "Pending";
            }
        }
        await order.save();
        console.log("Order saved successfully");
        for (let i = 0; i < userCart.products.length; i++) {
            let item = userCart.products[i];
            const product = await Product.findById(item.productId);
            if (product) {
                product.Stock -= item.quantity;
                await product.save();
            } else {
                console.error(`Product with ID ${item.productId} not found.`);
            }
        }
        await Cart.updateOne(
            { userId: userId },
            {
                $unset: {
                    products: 1,
                },
            }
        );
        res.status(200).json({ message: "Order placed successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


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
            paymentStatus: "Pending",
        });
        console.log('order:', order);
        await order.save();
        if (order.orderStatus === "Payment Pending") {
            console.log("Order status is pending payment. Cart update skipped.");
            return;
        }
        for (let i = 0; i < userCart.products.length; i++) {
            let item = userCart.products[i];
            const product = await Product.findById(item.productId);
            if (product) {
                product.Stock -= item.quantity;
                await product.save();
            } else {
                console.error(`Product with ID ${item.productId} not found.`);
            }
        }
        const options = {
            amount: totalAmount * 100,
            currency: 'INR',
            receipt: order.orderId,
        };
        console.log('option:', options);
        instance.orders.create(options, async function (err, razorpayOrder) {
            if (err) {
                console.error('Failed to create Razorpay order:', err);
                return res.status(500).json({ error: "Failed to create Razorpay order" });
            } else {
                console.log('razorpayOrder:', razorpayOrder);
                console.log('order ID:', orderId);
                res.json({ payment: false, method: "UPI", razorpayOrder: razorpayOrder, order: orderId });
            }
        });
    } catch (error) {
        console.error('Error in onlinePlaceOrder:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


const verifyRazorpayPayment = async (req, res) => {
    try {
        const { order } = req.body;
        const userId = req.session.user_id;
        await Order.updateOne({ orderId: order }, { paymentStatus: "Success", orderStatus: "Order Placed" });
        console.log(userId, 'adsfasdfadfasdfauserID')
        const result = await Cart.updateOne(
            { userId: userId },
            {
                $unset: {
                    products: 1,
                },
            }
        );
        console.log('result', result)
        res.status(200).json({ status: true });

    } catch (error) {
        console.error('Error in verifyRazorpayPayment:', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


const onlinePaymentFailed = async (req, res) => {
    try {
        let orderId = req.body.order
        console.log('failedOrder:www', orderId);
        const orderData = await Order.findOne({ orderId });
        console.log('fffffff', orderData);
        if (!orderData) {
            console.log('insideeee');
            return res.status(404).json({ error: "Order not found" });
        }
        orderData.orderStatus = "Payment Pending";
        orderData.paymentStatus = "Payment Failed";
        await orderData.save();
        console.log('orderData before saving:', orderData);
        res.status(200).json({ message: "Order status updated to Payment Pending and Payment Failed" });
    } catch (error) {
        console.error('Error updating order status:', error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


const repaymentPage = async (req, res) => {
    try {
        const orderId = req.query._id
        const order = await Order.findOne(orderId).populate({
            path: 'products.productId',
            model: 'Product'
        })
        const userId = req.session.user_id;
        const userData = await User.findById(userId)
        const addressData = await Address.find({ userId: userId })
        res.render('repayment', { order, addressData, userData })
    } catch (error) {
        console.error(error);
    }
}


const orderSuccess = async (req, res) => {
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
        console.log('totalAmount', totalAmount)
        const code = req.body.code;
        console.log('code', code)
        const coupon = await Coupon.findOne({ name: code });
        console.log('coupon', coupon)
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


const checkoutSaveAddress = async (req, res) => {
    try {
        const { addressType, name, housename, street, city, district, state, pincode, phonenumber, altPhone } = req.body
        console.log(req.body)
        const newAddress = new Address({
            userId: req.session.user_id,
            addressType,
            name,
            housename,
            street,
            city,
            district,
            state,
            pincode,
            phonenumber,
            altPhone
        })
        console.log('hfbhgs', newAddress)
        const result = await newAddress.save();
        console.log(result)
        res.status(200).send('success')
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}


module.exports = {
    checkOutPage,
    placeOrder,
    onlinePlaceOrder,
    onlinePaymentFailed,
    verifyRazorpayPayment,
    orderSuccess,
    applyCoupon,
    checkoutSaveAddress,
    repaymentPage
}