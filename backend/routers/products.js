//Initiating router
const express = require("express");
const router = express.Router();

//Import the models
const { Product } = require("../models/product");
const { Category } = require("../models/category");

//----Getters----

//Get product list
router.get(`/`, async (req, res) => {
  const productList = await Product.find();
  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(productList);
});

//----Setters----

//Create new product
router.post(`/`, async (req, res) => {
  try {
    //Validate category
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).send("Invalid Category");
    }

    let newProduct = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      isFeatured: req.body.isFeatured,
    });

    newProduct = await newProduct.save();
    if (!newProduct) {
      return res.status(500).send("Product cannot be created");
    }
    return res.send(newProduct);

  } catch (err) {
    return res.status(400).send(err);
  }
});

module.exports = router;
