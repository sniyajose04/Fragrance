const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    userName: {
        type: String,
        required: true
    },
    houseName: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    is_listed:{
        type:Boolean,
        default:true
    }
})

module.exports = mongoose.model('Address', addressSchema)