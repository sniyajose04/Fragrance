const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    name : {

        type:String,
        required:true
    },
    discount : {

        type:String,
        required:true
    },
    minpurchaseamount:{
        type:Number,
        required:true
    },
    start:{
        type:Date,
        required:true
    },
    end:{
        type:Date,
        required:true
    },
    isList:{
        type:Boolean,
        required:true,
        default:true
    },
    usedByUsers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }]
},{versionKey:false})

module.exports = mongoose.model('Coupon',couponSchema)






