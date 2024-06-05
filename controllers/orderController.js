const Order = require('../models/orderModel')
const Product = require('../models/productModel');
const Wallet = require('../models/walletModel')

const orderList = async (req, res) => {
    try {
        const order = await Order.find().populate('userId')
        res.render('orderlist', { order });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


const orderDetail = async (req, res) => {
    try {
        const orderId = req.query.orderId
        console.log('orderId', orderId)
        const orderData = await Order.findById(orderId)
            .populate('userId')
            .populate('products.productId')
            .populate('address');

        res.render('orderDetail', { orderData })
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}


const orderDetailChange = async (req, res) => {
    try {
        const orderID = req.body.orderID;
        const status = req.body.statusID;
        console.log('Order ID:', orderID);
        console.log('New Status:', status);
        const order = await Order.findOne({ _id: orderID }).populate('userId');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }
        order.orderStatus = status;
        console.log('Updated Status:', status);
        if (status === "Cancelled" || status === "Returned") {
            const refundAmount = order.totalAmount;
            const walletData = await Wallet.findOne({ user: order.userId._id });
            if (walletData) {
                walletData.walletBalance += refundAmount;
                walletData.transaction.push({
                    type: "credit",
                    amount: refundAmount,
                });
                await walletData.save();
                console.log('Updated Wallet Data:', walletData);
            } else {
                const wallet = new Wallet({
                    user: order.userId._id,
                    transaction: [{ type: "credit", amount: refundAmount }],
                    walletBalance: refundAmount,
                });
                await wallet.save();
                console.log('New Wallet Created:', wallet);
            }
            order.paymentStatus = "Refunded";
        }
        await order.save();
        console.log('Updated Order:', order);
        res.status(200).json({ success: true, message: 'Order status updated successfully.' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};


module.exports = {
    orderList,
    orderDetail,
    orderDetailChange
}

