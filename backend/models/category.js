const mongoose = require('mongoose');

//Schema for database
const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    icon: {
        type: String
    },
    color: {
        type: String
    }
})

//Model for nodejs
exports.Category = mongoose.model('Category',categorySchema);