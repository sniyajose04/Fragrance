const Admin = require('../models/userModels');
const bcrypt = require('bcrypt')
const User = require('../models/userModels')
const Product = require('../models/productModel');
const Category = require('../models/categoryModel')
const Order = require('../models/orderModel')



const adminDashboard = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = 6;
        const skip = (page - 1) * pageSize;
        const orderCount = await Order.countDocuments({});
        const totalPages = Math.ceil(orderCount / pageSize);

        const user = await User.find({});
        const product = await Product.find({});
        const category = await Category.find({});
        const order = await Order.find({}).populate('address').skip(skip).limit(pageSize);

        let totalTransaction = 0;
        order.forEach((item) => {
            if (item.totalAmount !== undefined && item.totalAmount !== null) {
                totalTransaction += parseFloat(item.totalAmount);
            }
        });

        const orderData = await Order.aggregate([
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

        const userData = await User.aggregate([
            {
                $group: {
                    _id: { $month: '$date' },
                    totalRegister: { $sum: 1 },
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        const orderStats = await Order.aggregate([
            { $unwind: '$products' },
            {
                $lookup: {
                    from: 'product',
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $lookup: {
                    from: 'category',
                    localField: 'productInfo.categoryId',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            { $unwind: '$categoryInfo' },
            {
                $group: {
                    _id: '$categoryInfo._id',
                    categoryName: { $first: '$categoryInfo.categoryName' },
                    orderCount: { $sum: 1 }
                }
            }
        ]);

        const categoryNames = JSON.stringify(orderStats.map(stat => stat.categoryName));
        const orderCounts = JSON.stringify(orderStats.map(stat => stat.orderCount));

        const monthlyData = Array.from({ length: 12 }, (_, index) => {
            const monthOrderData = orderData.find(item => item._id.month === index + 1) || { totalOrders: 0, totalProducts: 0 };
            const monthUserData = userData.find(item => item._id === index + 1) || { totalRegister: 0 };
            return {
                totalOrders: monthOrderData.totalOrders,
                totalProducts: monthOrderData.totalProducts,
                totalRegister: monthUserData.totalRegister
            };
        });

        const totalOrdersJson = JSON.stringify(monthlyData.map(item => item.totalOrders));
        const totalProductsJson = JSON.stringify(monthlyData.map(item => item.totalProducts));
        const totalRegisterJson = JSON.stringify(monthlyData.map(item => item.totalRegister));
        console.log(totalOrdersJson,totalProductsJson);
        res.render('adminpanel', {
            user,
            product,
            category,
            order,
            currentPage: page,
            totalPages,
            totalTransaction,
            totalOrdersJson,
            totalProductsJson,
            totalRegisterJson,
            categoryNames,
            orderCounts
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

                if (passwordMatch){
                    req.session.admin_id = userdata._id;
                    res.redirect('/admin/adminpanel');
                }else{
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
        if (req.query.startDate && req.query.endDate) {
            const orders = await Order.find({
                orderDate: {
                    $gte: new Date(req.query.startDate),
                    $lte: new Date(req.query.endDate)
                }
            }).populate('userId').sort({ orderDate: -1 });

            let totalTransaction = 0;
            let totalOrders = 0;

            const userData = await Order.distinct('userId', {
                orderDate: {
                    $gte: new Date(req.query.startDate),
                    $lte: new Date(req.query.endDate)
                }
            });
            let totalCustomers = userData.length;
            let onlinePayments = 0;
            let cashOnDelivery = 0;
            let orderCancelled = 0;

            orders.forEach((item) => {
                if (item.totalAmount !== undefined && item.totalAmount !== null) {
                    totalTransaction += parseFloat(item.totalAmount);
                }
                totalOrders++;
                if (item.paymentMethod === 'Paypal') {
                    onlinePayments++;
                } else {
                    cashOnDelivery++;
                }
                if (item.orderStatus === 'Cancelled') {
                    orderCancelled++;
                }
            });

            res.render('salesReport', {
                orders,
                totalCustomers,
                totalOrders,
                totalTransaction,
                onlinePayments,
                cashOnDelivery,
                orderCancelled,
                start: req.query.startDate,
                end: req.query.endDate
            });
        } else {
            const orders = await Order.find({}).populate('userId').sort({ orderDate: -1 });
            let totalTransaction = 0;
            let totalOrders = 0;

            const userData = await Order.distinct('userId');
            let totalCustomers = userData.length;
            let onlinePayments = 0;
            let cashOnDelivery = 0;
            let orderCancelled = 0;

            orders.forEach((item) => {
                if (item.totalAmount !== undefined && item.totalAmount !== null) {
                    totalTransaction += parseFloat(item.totalAmount);
                }
                totalOrders++;
                if (item.paymentMethod === 'Paypal') {
                    onlinePayments++;
                } else {
                    cashOnDelivery++;
                }
                if (item.orderStatus === 'Cancelled') {
                    orderCancelled++;
                }
            });

            res.render('salesReport', {
                orders,
                totalCustomers,
                totalOrders,
                totalTransaction,
                onlinePayments,
                cashOnDelivery,
                orderCancelled
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};



const dateFilter = async (req, res) => {
    try {
       
        const startDate = req.body.startDate
        console.log('startDate',startDate)
        const endDate = req.body.endDate
        console.log('endDate',endDate)
        res.redirect(`/admin/salesReport?startDate=${startDate}&endDate=${endDate}`)
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
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
