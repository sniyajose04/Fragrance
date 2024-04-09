const mongoose = require('mongoose');
const otpschema = new mongoose.Schema({
email:{
     type : String,
     required : true,
},
otp:{
 type:Number,
 required : true
},
createdAt:{
    type:Date,
    default:Date.now(),
    expires:120
  }
})

module.exports = mongoose.model('Otp',otpschema)