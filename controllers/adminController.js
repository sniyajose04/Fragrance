const Admin = require('../models/userModels');
const bcrypt = require('bcrypt')
const User = require('../models/userModels')
const Product = require('../models/productModel');
const Category = require('../models/categoryModel')
const Order = require('../models/orderModel')


const adminDashboard = async (req, res) => {
    try {
        const user = await User.find({});
        const product = await Product.find({});
        const category = await Category.find({});
        const order = await Order.find({}).populate('address');
        let totalTransaction = 0;
        order.forEach((item) => {
            if (item.totalAmount !== undefined && item.totalAmount !== null) {
                totalTransaction += parseFloat(item.totalAmount);
            }
        });

        const monthlyOrderData = await Order.aggregate([
            { $unwind: '$products' },
            {
                $group: {
                    _id: { month: { $month: '$orderDate' } },
                    totalOrders: { $sum: 1 },
                    totalProducts: { $sum: '$products.quantity' },
                }
            },
            { $sort: { '_id.month': 1 } }
        ]);
        const monthlyUserData = await User.aggregate([
            {
                $group: {
                    _id: { $month: '$date' },
                    totalRegister: { $sum: 1 },
                }
            },
            { $sort: { '_id': 1 } }
        ]);
        const monthlyData = Array.from({ length: 12 }, (_, index) => {
            const monthOrderData = monthlyOrderData.find(item => item._id.month === index + 1) || { totalOrders: 0, totalProducts: 0 };
            const monthUserData = monthlyUserData.find(item => item._id === index + 1) || { totalRegister: 0 };
            return {
                totalOrders: monthOrderData.totalOrders,
                totalProducts: monthOrderData.totalProducts,
                totalRegister: monthUserData.totalRegister
            };
        });

        const weeklyOrderData = await Order.aggregate([
            { $unwind: '$products' },
            {
                $group: {
                    _id: { week: { $isoWeek: '$orderDate' } },
                    totalOrders: { $sum: 1 },
                    totalProducts: { $sum: '$products.quantity' },
                }
            },
            { $sort: { '_id.week': 1 } }
        ]);
        const weeklyUserData = await User.aggregate([
            {
                $group: {
                    _id: { $isoWeek: '$date' },
                    totalRegister: { $sum: 1 },
                }
            },
            { $sort: { '_id': 1 } }
        ]);
        const weeklyData = Array.from({ length: 52 }, (_, index) => {
            const weekOrderData = weeklyOrderData.find(item => item._id.week === index + 1) || { totalOrders: 0, totalProducts: 0 };
            const weekUserData = weeklyUserData.find(item => item._id === index + 1) || { totalRegister: 0 };
            return {
                totalOrders: weekOrderData.totalOrders,
                totalProducts: weekOrderData.totalProducts,
                totalRegister: weekUserData.totalRegister
            };
        });
        const totalOrdersJson = JSON.stringify(monthlyData.map(item => item.totalOrders));
        const totalProductsJson = JSON.stringify(monthlyData.map(item => item.totalProducts));
        const totalRegisterJson = JSON.stringify(monthlyData.map(item => item.totalRegister));

        const totalOrdersWeeklyJson = JSON.stringify(weeklyData.map(item => item.totalOrders));
        const totalProductsWeeklyJson = JSON.stringify(weeklyData.map(item => item.totalProducts));
        const totalRegisterWeeklyJson = JSON.stringify(weeklyData.map(item => item.totalRegister));
        res.render('adminpanel', {
            user,
            product,
            category,
            order,
            totalTransaction,
            totalOrdersJson,
            totalProductsJson,
            totalRegisterJson,
            totalOrdersWeeklyJson,
            totalProductsWeeklyJson,
            totalRegisterWeeklyJson
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


const adminlogin = async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error);
    }
};


const verifyadmin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userdata = await Admin.findOne({ email: email });
        if (userdata) {
            if (userdata.is_admin) {
                const passwordMatch = await bcrypt.compare(password, userdata.password);
                if (passwordMatch) {
                    req.session.admin_id = userdata._id;
                    res.redirect('/admin/adminpanel');
                } else {
                    return res.render('login', { message: "Password is incorrect" });
                }
            } else {
                return res.render('login', { message: "Access denied. Not an admin." });
            }
        } else {
            return res.render('login', { message: "Email is incorrect" });
        }
    } catch (error) {
        console.error("Error in verifyadmin:", error);
        res.status(500).send("Internal Server Error");
    }
};


const userDetail = async (req, res) => {
    try {
        const userdata = await Admin.find({ is_admin: false })
        res.render('Userlist', { userdata })
    } catch (error) {
        console.log(error)
    }
}


const userBlock = async (req, res) => {
    try {
        const userID = req.params.id;
        const updateData = await User.findByIdAndUpdate(userID, {
            is_blocked: true
        });
        const userData = await User.findOne({ _id: userID })
        res.status(200).json({ success: true, block: userData.is_blocked });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "An error occurred while blocking the user" });
    }
}


const userUnblock = async (req, res) => {
    try {
        const userID = req.params.id;
        const upadateData = await User.findByIdAndUpdate(userID, {
            is_blocked: false
        });
        const userData = await User.findOne({ _id: userID })
        res.status(200).json({ success: true, block: userData.is_blocked });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "An error occurred while Unblocking the user" });
    }
}


const adminLogout = (req, res) => {
    try {
        req.session.admin_id = undefined;
        res.redirect('/admin')
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}


const salesReport = async (req, res) => {
    try {
        const orderStatusFilter = { $or: [{ orderStatus: 'Order Placed' }, { orderStatus: 'Delivered' }] };
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10; // Default to 10 orders per page if not provided
        const skip = (page - 1) * limit;

        const dateFilter = {};
        if (req.query.startDate && req.query.endDate) {
            dateFilter.orderDate = {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate)
            };
        }

        const queryFilter = { ...orderStatusFilter, ...dateFilter };

        const orders = await Order.find(queryFilter)
            .populate('userId')
            .populate('Coupon')
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(limit);

        const totalOrdersCount = await Order.countDocuments(queryFilter);
        const userData = await Order.distinct('userId', dateFilter);
        const totalCustomers = userData.length;

        let totalTransaction = 0;
        let totalOrders = 0;
        let onlinePayments = 0;
        let cashOnDelivery = 0;
        let orderCancelled = 0;

        orders.forEach((item) => {
            if (item.totalAmount !== undefined && item.totalAmount !== null) {
                totalTransaction += parseFloat(item.totalAmount);
            }
            totalOrders++;
            if (item.paymentMethod === 'Online Payment') {
                onlinePayments++;
            } else {
                cashOnDelivery++;
            }
            if (item.orderStatus === 'Cancelled') {
                orderCancelled++;
            }
        });

        const totalPages = Math.ceil(totalOrdersCount / limit);

        res.render('salesReport', {
            orders,
            totalCustomers,
            totalOrders,
            totalTransaction,
            onlinePayments,
            cashOnDelivery,
            orderCancelled,
            currentPage: page,
            totalPages,
            limit,
            start: req.query.startDate,
            end: req.query.endDate
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};


const dateFilter = async (req, res) => {
    try {
        // console.log(req.query.startDate)
        const startDate = req.body.startDate
        const endDate = req.body.endDate
        res.redirect(`/admin/salesReport?startDate=${startDate}&endDate=${endDate}`)
    } catch (error) {
        console.log(error.message)
        res.redirect('/500')
    }
}


module.exports = {
    adminDashboard,
    adminlogin,
    verifyadmin,
    userDetail,
    userBlock,
    userUnblock,
    adminLogout,
    salesReport,
    dateFilter
  
}
