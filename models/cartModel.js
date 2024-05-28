const mongoose = require('mongoose')
const cartSchema = new mongoose.Schema({
   
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    products: [{
        productId: {
            type:mongoose.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1 
        }
}]

})
module.exports = mongoose.model('Cart',cartSchema)



