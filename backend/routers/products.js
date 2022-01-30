//Initiating router
const express = require("express");
const router = express.Router();

//Import the models
const {Product} = require('../models/product');


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
router.post(`/`, (req, res) => {
  const newProduct = new Product({
    name: req.body.name,
    image: req.body.image,
    countInStock: req.body.countInStock,
  });

  newProduct
    .save()
    .then((createdProduct) => {
      res.status(201).json(createdProduct);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

module.exports = router;