//Initiating router
const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');

//Import the models
const { Product } = require("../models/product");
const { Category } = require("../models/category");

//----Getters----

//Get product list
router.get(`/`, async (req, res) => {
  let filter = {}
  if(req.query.categories){
    filter = {category: req.query.categories.split(",")}
  }

  const productList = await Product.find(filter).populate('category');
  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(productList);
});

//Get total count of products
router.get('/get/count', async (req, res) => {
  const productCount = await Product.countDocuments();

  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    productCount: productCount,
  });
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

//Update product using id
router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Product Id");
  }
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );

  if (!product) return res.status(500).send("the product cannot be updated!");

  res.send(product);
});

//Delete product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndRemove(req.params.id);
    if (product) {
      return res
        .status(200)
        .json({ success: true, message: "the product is deleted!" });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "product not found!" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});

module.exports = router;
