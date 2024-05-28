const User = require('../models/userModels');
const Address =require('../models/addressModel');
const Order = require('../models/orderModel')
const Wallet = require('../models/walletModel')

const userDetailPage = async (req, res) => {
    try {
       console.log('userii',req.session.user_id);
        const addresses = await Address.find({ userId: req.session.user_id });

        const user = await User.findOne({ _id: req.session.user_id });

        const order = await Order.find({userId: req.session.user_id});

        const wallet = await Wallet.findOne({user: req.session.user_id})

        res.render('userDetail', { user, addresses ,order,wallet});
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
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


const saveAddress = async(req,res)=>{
    try {
        const{addressType,name,housename,street,city,district,state,pincode,phonenumber,altPhone}=req.body
        console.log(req.body)
        const newAddress = new Address({
            userId:req.session.user_id,
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
console.log('hfbhgs',newAddress)
        const result = await newAddress.save();
        console.log(result)
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
                model: 'Product'  // Ensure the correct model name
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
        console.log('orderId', orderId);
        const { reason, productId } = req.body;
        console.log('req.body', req.body);

        let order = await Order.findOne({ _id: orderId })
            .populate('userId')
            .populate('address')
            .populate('products.productId');
        
        console.log('order', order);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        let totalAmount = order.totalAmount;
        console.log('totalAmount', totalAmount);

        const product = order.products.find(
            (item) => item.productId._id.toString() === productId
        );

        console.log('product', product);

        if (!product) {
            return res.status(404).json({ error: 'Product not found in order' });
        }

        const couponData = order.coupon ? await Coupon.findById(order.coupon) : null;
        console.log('couponData', couponData);

        const discount = couponData ? (couponData.discount / 100) : 0;
        console.log('discount',discount

        )
        const refundAmount = product.productId.promotionalPrice * product.quantity * (1 - discount);
console.log('refundAmount',refundAmount)
console.log("vszgfys",order.orderStatus)
        if (order.orderStatus === "Order Placed" || order.orderStatus === "Delivered") {
            if (order.paymentMethod === "Wallet" || order.paymentMethod === "Online Payment") {
                const walletData = await Wallet.findOne({ user: order.userId._id });
console.log('walletData',walletData)
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


// const editAddress = async (req, res) => {
//     try {
//         console.log("asdfghjkl");
//         const userId = req.session.user_id; 
//         const addressData = await Address.findOne({ userId });

//         if (!addressData) {
//             return res.status(404).json({ message: "Address not found for this user" });
//         }
// console.log("req.body",req.body)
    
//         addressData.addressType = req.body.addressType;

//         addressData.name = req.body.name;
//         addressData.housename = req.body.housename;
//         addressData.street = req.body.street;
//         addressData.city = req.body.city;
//         addressData.district = req.body.district;
//         addressData.state = req.body.state;
//         addressData.pincode = req.body.pincode;
//         addressData.phonenumber = req.body.phonenumber;
//         addressData.altPhone = req.body.altPhone;

       
//         await addressData.save();

//         res.status(200).json({ message: "Address updated successfully", addressData });
//     } catch (err) {
//         console.error("Error editing address:", err);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };



    

module.exports = {
    userDetailPage,
    userPassword,
    saveAddress,
    // editAddress,
     orderDetailPage,
     orderCancel
    
}