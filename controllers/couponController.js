const Coupon = require('../models/couponModel')
const User = require('../models/userModels')

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
        console.log(req.body)

        const data = {
            couponName: name,
            startDate: new Date(start + 'T00:00:00'),
            endDate: new Date(end + 'T00:00:00'),
            minimumPurchase: minpurchaseamount,
            discount: discount
        }
        console.log('data', data);
        const couponData = await Coupon.create({
            name: data.couponName,
            discount: data.discount,
            minpurchaseamount: data.minimumPurchase,
            start: data.startDate,
            end: data.endDate
        });


        console.log('couponData:', couponData);
        res.redirect('/admin/couponlist')
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const deleteCoupon = async (req, res) => {
    try {
        const id = req.query.id;
        console.log('id:',id)
        const couponData = await Coupon.findById(id);
        console.log('couponData:',couponData)
       if(!couponData){
        console.log('coupon  not found')
     return res.status(404).send('coupon not found')
       }

       await Coupon.findByIdAndDelete(id);
       console.log('Coupon deleted successfully');
   
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