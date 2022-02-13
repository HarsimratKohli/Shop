//Initiating router
const express = require("express");
const router = express.Router();

//Import the models
const { Category } = require("../models/category");

//----Getters----

//Get categories list
router.get(`/`, async (req, res) => {
  const categoryList = await Category.find();
  if (!categoryList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(categoryList);
});

//Get category by Id
router.get("/:id", async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    } else {
      return res.status(200).send(category);
    }
  } catch (err) {
    return res.status(400).json({ success: false, error: err });
  }
});

//----Setters----

//Create new category
router.post(`/`, async (req, res) => {
  let category = new Category({
    name: req.body.name,
    image: req.body.image,
    icon: req.body.icon,
    color: req.body.color,
  });

  category = await category.save();
  if (!category) {
    return res.status(404).send("the category wasn't created");
  } else {
    return res.status(201).send(category);
  }
});

//Delete a category
router.delete(`/:id`, async (req, res) => {
  try {
    let category = await Category.findByIdAndRemove(req.params.id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    } else {
      return res
        .status(200)
        .json({ success: true, message: "Category deleted" });
    }
  } catch (err) {
    return res.status(400).json({ success: false, error: err });
  }
});

//Update the category
router.put(`/:id`, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    }, {new: true});

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    } else {
      return res.status(200).send(category);
    }
  } catch (err) {
    return res.status(400).send(err);
  }
});

module.exports = router;
