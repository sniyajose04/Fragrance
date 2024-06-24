const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    name: {
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
   
})

module.exports = mongoose.model('Address', addressSchema)