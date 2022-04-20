//Initiating router
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};
//Upload destination
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid Image type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const extension = FILE_TYPE_MAP[file.mimetype];
    const filename = file.originalname.split(" ").join("-");
    cb(null, `${filename}-${Date.now()}.${extension}`);
  },
});
const uploadOptions = multer({ storage: storage });

//Import the models
const { Product } = require("../models/product");
const { Category } = require("../models/category");

//----Getters----

//Get product list
router.get(`/`, async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }

  const productList = await Product.find(filter).populate("category");
  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(productList);
});

//Get total count of products
router.get("/get/count", async (req, res) => {
  const productCount = await Product.countDocuments();

  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.status(200).send({
    productCount: productCount,
  });
});

//Get featured products with limit
router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const products = await Product.find({ isFeatured: true }).limit(+count);

  if (!products) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(products);
});

//----Setters----

//Create new product
router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  try {
    //Validate category
    const category = await Category.findById(req.body.category);
    const file = req.file;

    if (!category) {
      return res.status(400).send("Invalid Category");
    }

    if (!file) {
      return res.status(400).send("Image in the request not found");
    }

    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    const filename = req.file.fieldname;

    let newProduct = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: `${basePath}${filename}`,
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
    return res.status(201).send(newProduct);
  } catch (err) {
    return res.status(400).send(err);
  }
});

//Update product using id
router.put("/:id", uploadOptions.single("image"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Product Id");
  }
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const productExists = await Product.findById(req.params.id);
  if (!productExists) {
    return res.status(400).send("Invalid Product Id");
  }
  console.log("Wpadasdsa");
  const file = req.file;
  let imagePath;
  if (file) {
    const filename = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    imagePath = `${basePath}${filename}`;
  } else {
    imagePath = product.image;
  }
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: imagePath,
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

  res.status(204).send(product);
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

//Update gallery images
router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid Product Id");
    }

    let imagePaths = [];
    const files = req.files;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    if (files) {
      files.map((file) => {
        imagePaths.push(`${basePath}${file.filename}`);
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagePaths,
      },
      { new: true }
    );

    if (!product) {
      return res.status(500).send("the product cannot be updated!");
    }

    res.status(204).send(product);
  }
);

module.exports = router;
