const mongoose = require('mongoose');

//Schema for database
const userSchema = mongoose.Schema({
    name: String,
    image: String,
    countInStock: {
        type: Number,
        required: true
    }
})

//Model for nodejs
exports.User = mongoose.model('User',userSchema);