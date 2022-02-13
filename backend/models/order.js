const mongoose = require('mongoose');

//Schema for database
const orderSchema = mongoose.Schema({
    name: String,
    image: String,
    countInStock: {
        type: Number,
        required: true
    }
})

//Model for nodejs
exports.Order = mongoose.model('Order',orderSchema);