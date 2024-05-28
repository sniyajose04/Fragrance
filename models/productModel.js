const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    product_title: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    Stock:{
        type:Number,
        required:true
    },
    
    regularPrice:{
        type:Number,
        required:true
    },
    promotionalPrice:{
        type:Number,
        required:true
    },

    offerPrice:{
        type:Number,
        default: 0
    },
    discountApplied: {
        type: Boolean,
        default: false 
    },
    offerAmount:{
        type:Number,
        },
    images:[{
        filename:{
            type:String
        }
    }],
    Category:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:'Category'
    },
    listDate:{
        type: Date,
        default: Date.now
    },
   is_block:{
    type:Boolean,
    default:false
   }  ,
   
})

module.exports = mongoose.model('Product', productSchema)