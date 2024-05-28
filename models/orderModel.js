const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
   userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDetials",
      required:true
  },
  orderId:{
      type:String,
      required:true

  },
  products: [{
      productId: {
          type:  mongoose.Schema.Types.ObjectId,
          ref : "Product",
          required:true
      },
      quantity: {
          type: Number,
          required:true
      }
  }],
  address:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Address"
  },
  orderDate:{
      type:Date,
      default:Date.now,
  },
  totalAmount:{
      type:Number,
      required:true
  },
  orderStatus:{
    type:String,
    enum:["Order Placed","Shipped","Delivered","Cancelled","Returned","Return Processing","Payment Pending"],
    default:"Order Placed"
},
paymentStatus:{
    type:String,
    enum:["Pending","Success","Failed","Refunded","Payment Failed"],
    default:"Pending"
},
paymentMethod:{
    type:String,
    required:true
},
  cancelReason:{
      type:String,

  },
  returnReason:{
      type:String
  },

});

   module.exports =  mongoose.model('Order',orderSchema)
    