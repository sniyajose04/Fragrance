
const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', 
        required: true
    },
    discount:{
        type:Number,
        required:true
    },
    
    start:{
        type:String,
        required:true

    },
    end:{
        type:String,
        required:true
    }
},{versionKey:false})

module.exports = mongoose.model("Offer",offerSchema);