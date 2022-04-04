const mongoose = require('mongoose');

//Schema for database
const orderItemSchema = mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    product : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
})

//Model for nodejs
exports.OrderItem = mongoose.model('OrderItem',orderItemSchema);