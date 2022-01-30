const mongoose = require('mongoose');

//Schemas for mongoose
const productSchema = mongoose.Schema({
  name: String,
  image: String,
  countInStock: {
    type: Number,
    required: true,
  }
});

//Models: for creating collection in nodejs
exports.Product = mongoose.model('Product', productSchema);
