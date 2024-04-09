const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    producttitle: {
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
    images:[{
        filename:{
            type:String
        }
    }],
    Category:{
        type:mongoose.Types.ObjectId,
        required:true
    },
   is_block:{
    type:Boolean,
    default:false
   }
  

})

module.exports = mongoose.model('Product', productSchema)