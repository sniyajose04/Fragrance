const User = require('../models/userModels');
const Address = require('../models/addressModel');
const Order = require('../models/orderModel')
const Wallet = require('../models/walletModel')
const bcrypt = require('bcrypt');


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


const userEdit = async (req, res) => {
    try {
        const { user_id, name, mobile } = req.body;

        if (!user_id) {
            return res.status(400).json({ success: false, message: 'User ID is missing or invalid' });
        }

        const userData = await User.findById(user_id);

        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        userData.name = name;
        userData.mobile = mobile;
        await userData.save();

        res.status(200).json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


const securePassword = async (Password) => {
    try {
        const passwordHash = await bcrypt.hash(Password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error)
    }
}
  

const changePassword = async (req, res) => {
    try {
      const user_id = req.session.user_id;
      const current_password = req.body.password;
      const new_password = req.body.newPassword;
      if (!current_password || !new_password) {
        return res.status(400).json({ success: false, message: 'Passwords are required' });
      }
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(400).json({ success: false, message: 'User not found' });
      }
      if (!user.password) {
        return res.status(500).json({ success: false, message: 'User password not found' });
      }
      const isPasswordMatch = await bcrypt.compare(current_password, user.password);
      if (!isPasswordMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      const secure_new_password = await securePassword(new_password);
      const updateData = await User.findByIdAndUpdate(
        user_id,
        { $set: { password: secure_new_password } },
        { new: true } // return the updated document
      );
      if (updateData) {
        return res.json({ success: true, message: 'Password updated successfully' });
      } else {
        return res.status(500).json({ success: false, message: 'Error updating password' });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


const accountDetailPage = async(req,res)=>{
    try {
        const user = await User.findOne({ _id: req.session.user_id });
        res.render('accountDetail',{user})
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error'); 
    }
}


const userAddressPage = async(req,res)=>{
    try {
        const user = await User.findOne({ _id: req.session.user_id });
        const addressData = await Address.find({ userId: req.session.user_id });
        console.log('Addresses retrieved:', addressData);
        res.render('userAddress',{user,addressData})
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');  
    }
}


const addAddressPage = async(req,res)=>{
    try {
        const user = await User.findOne({ _id: req.session.user_id });
        const addresses = await Address.find({ userId: req.session.user_id });
        res.render('addAddress',{user,addresses})
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error'); 
    }
}


const addAddress = async (req, res) => {
    try {
        console.log('Request received:', req.body); // Log incoming request data
        const userId = req.session.user_id;
        const { name, houseName, street, city, state, pincode, phoneNumber } = req.body;
        const address = new Address({
            userId,
            name,
            houseName,
            street,
            city,
            state,
            pincode,
            phoneNumber,
            is_listed: true
        });
        const addressData = await address.save();
        console.log('Address saved:', addressData);
        res.status(200).json({ success: true }); // Updated to send JSON with success key
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};



const editAddressPage = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const user = await User.findOne({ _id: userId }); // Assuming userId is correctly set
        const id = req.query.id;
        console.log('id :',id)
        const addressData = await Address.findById(id);
console.log("////////////////",addressData)
        if (!addressData) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        res.render("editAddress", { addressData, user }); // Pass addressData and user to the template
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};



  
const editAddress = async (req, res) => {
    try {
        const { name, houseName, street, city, state, pincode, phoneNumber, addressData_id } = req.body;
        const updateData = await Address.findByIdAndUpdate(
            addressData_id,
            {
                $set: {
                    name,
                    houseName,
                    street,
                    city,
                    state,
                    pincode,
                    phoneNumber,
                    is_listed: true
                }
            },
            { new: true }
        );

        res.status(200).json({ success: true, message: "Updated successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


  const deleteAddress = async(req,res)=>{
    try {
        const id = req.query.id
        const addressData = await Address.findByIdAndUpdate(
            {_id:id},
            {$set:{
                is_listed:false
            }}
        )
        res.redirect('/userAddress')

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' }); 
    }
  }


const userPassword = async (req, res) => {
    try {
        const { password, newPassword, confirmPassword } = req.body;

        if (password || newPassword || confirmPassword) {
            if (!password || !newPassword || !confirmPassword) {
                return res.status(400).send('All password fields are required.');
            }

            if (newPassword.length < 6) {
                return res.status(400).send('New password must be at least 6 characters long.');
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).send('New password and confirm password do not match.');
            }

            
            const user = await User.findOne({ _id: req.session.user_id });

            if (!user) {
                return res.status(404).send('User not found');
            }

            // Compare the provided current password with the stored hashed password
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).send('Current password is incorrect');
            }

            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Update the user's password in the database
            user.password = hashedPassword;
            await user.save();

            return res.send('Password updated successfully');
        }

        res.send('No password change requested');

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};





const orderDetailPage = async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.session.user_id })
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
        res.render('orderDetail', { order ,user});
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
        const couponData = order.Coupon ? await Coupon.findById(order.Coupon) : null;
        const discount = couponData ? (couponData.discount / 100) : 0;
        const refundAmount = product.productId.promotionalPrice * product.quantity * (1 - discount);
        if (order.orderStatus === "Order Placed" || order.orderStatus === "Delivered") {
            if (order.paymentMethod === 'cash on delivery' || order.paymentMethod === "Online Payment") {
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
    orderDetailPage,
    orderCancel,
    repaymentPage,
    accountDetailPage,
    addAddressPage,
    userAddressPage,
    addAddress,
    editAddressPage,
    editAddress,
    deleteAddress,
    changePassword,
    userEdit,
    securePassword
}