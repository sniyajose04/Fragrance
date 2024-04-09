const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    is_list: {
        type: Boolean,
        default: true
    },
    description: {
        type: String,
        required: true
    }

})

module.exports = mongoose.model('Category', categorySchema)