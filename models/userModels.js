const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true
    },

    mobile:{
        type:String,
        required:true
    },

    password:{
        type:String,
        required:true
    },

    is_blocked:{
        type:Boolean,
        default:false
    },
    is_admin:{
       type:Boolean,
       default:false
    },
    is_verified:{
        type:Number,
        default:0,
    },
    Offer:{
    type:mongoose.Types.ObjectId,
    ref: "Offer",
    
    }
});

module.exports = mongoose.model('UserDetials',userSchema);