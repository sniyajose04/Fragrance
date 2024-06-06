const User = require('../models/userModels');
const Address = require('../models/addressModel');
const Order = require('../models/orderModel')
const Wallet = require('../models/walletModel')

const userDetailPage = async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.session.user_id });
        const user = await User.findOne({ _id: req.session.user_id });
        const order = await Order.find({ userId: req.session.user_id });
        const wallet = await Wallet.findOne({ user: req.session.user_id });
        let referralCode = user.referralCode;
        if (!referralCode) {
            referralCode = await generateUniqueReferralCode();
            user.referralCode = referralCode;
            await user.save();
        }
        res.render('userDetail', { user, addresses, order, wallet, referralCode });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}


async function generateUniqueReferralCode() {
    const RandomReferralCode = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const codeLength = 6;
        let referralCode = '';
        for (let i = 0; i < codeLength; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            referralCode += characters.charAt(randomIndex);
        }
        return referralCode;
    }
    let newReferralCode;
    let referralExists;
    do {
        newReferralCode = RandomReferralCode();
        referralExists = await User.findOne({ referralCode: newReferralCode });
    } while (referralExists);
    return newReferralCode;
}


const userPassword = async (req, res) => {
    const userId = req.session.user_id;
    const currentPassword = req.body.password;
    const newPassword = req.body.npassword;
    const confirmNewPassword = req.body.cpassword;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ error: 'New password and confirm password do not match' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const saveAddress = async (req, res) => {
    try {
        const { addressType, name, housename, street, city, district, state, pincode, phonenumber, altPhone } = req.body
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
        await newAddress.save();
        res.status(200).send('success')
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}


const orderDetailPage = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        const order = await Order.findById(orderId)
            .populate('userId')
            .populate({
                path: 'products.productId',
                model: 'Product'
            })
            .populate('address');
        if (!order) {
            return res.status(404).send('Order not found');
        }
        res.render('orderDetail', { order });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


const orderCancel = async (req, res) => {
    try {
        const orderId = req.query.id;
        const { reason, productId } = req.body;
        let order = await Order.findOne({ _id: orderId })
            .populate('userId')
            .populate('address')
            .populate('products.productId');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        let totalAmount = order.totalAmount;
        const product = order.products.find(
            (item) => item.productId._id.toString() === productId
        );
        if (!product) {
            return res.status(404).json({ error: 'Product not found in order' });
        }
        const couponData = order.coupon ? await Coupon.findById(order.coupon) : null;
        const discount = couponData ? (couponData.discount / 100) : 0;
        const refundAmount = product.productId.promotionalPrice * product.quantity * (1 - discount);
        if (order.orderStatus === "Order Placed" || order.orderStatus === "Delivered") {
            if (order.paymentMethod === "Wallet" || order.paymentMethod === "Online Payment") {
                const walletData = await Wallet.findOne({ user: order.userId._id });
                if (walletData) {
                    walletData.walletBalance += refundAmount;
                    walletData.transaction.push({
                        type: "credit",
                        amount: refundAmount,
                    });
                    await walletData.save();
                } else {
                    const wallet = new Wallet({
                        user: order.userId._id,
                        transaction: [{ type: "credit", amount: refundAmount }],
                        walletBalance: refundAmount,
                    });
                    await wallet.save();
                }
                order.paymentStatus = "Refunded";
            } else {
                order.paymentStatus = "Declined";
            }
            order.orderStatus = (order.orderStatus === "Order Placed") ? "Cancelled" : "Returned";
            if (order.orderStatus === "Cancelled") {
                order.cancelReason = reason;
            } else {
                order.returnReason = reason;
            }
            totalAmount -= refundAmount;
        }
        await Order.findByIdAndUpdate(
            orderId,
            {
                $set: {
                    products: order.products,
                    totalAmount,
                    orderStatus: order.orderStatus,
                    cancelReason: order.cancelReason,
                    returnReason: order.returnReason,
                    paymentStatus: order.paymentStatus,
                },
            },
            { new: true }
        );
        return res.status(200).json({ message: "Order cancelled successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "An error occurred while cancelling the order" });
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


module.exports = {
    userDetailPage,
    userPassword,
    saveAddress,
    orderDetailPage,
    orderCancel,
    repaymentPage,

}