const Coupon = require('../models/couponModel')

const couponList = async (req, res) => {
    try {
        const coupons = await Coupon.find({ isList: true });
        res.render('couponlist', { coupons });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}


const addCoupons = async (req, res) => {
    try {
        const { name, discount, minpurchaseamount, start, end } = req.body;
        const data = {
            couponName: name,
            startDate: new Date(start + 'T00:00:00'),
            endDate: new Date(end + 'T00:00:00'),
            minimumPurchase: minpurchaseamount,
            discount: discount
        }
        const couponData = await Coupon.create({
            name: data.couponName,
            discount: data.discount,
            minpurchaseamount: data.minimumPurchase,
            start: data.startDate,
            end: data.endDate
        });
        res.redirect('/admin/couponlist')
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}


const deleteCoupon = async (req, res) => {
    try {
        const id = req.query.id;
        const couponData = await Coupon.findById(id);
       if(!couponData){
     return res.status(404).send('coupon not found')
       }
       await Coupon.findByIdAndDelete(id);
       res.status(200).send('Coupon deleted successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}


module.exports = {
    couponList,
    addCoupons,
    deleteCoupon
}