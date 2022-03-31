//Initiating router
const express = require("express");
const router = express.Router();
const becrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = process.env.secret;

//Import the models
const { User } = require("../models/user");
const { response } = require("express");

//----Getters----

router.get("/", async (req, res) => {
  const userList = await User.find().select("-passwordHash");
  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(userList);
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");
  if (!user) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(user);
});

router.get('/get/count', async (req, res) => {
  const userCount = await User.countDocuments();

  if (!userCount) {
    res.status(500).json({ success: false });
  }
  res.status(200).send({
    userCount: userCount,
  });
});

//----Setters----

//Create new user
router.post(`/`, async (req, res) => {
  let user = new User({
    name: req.body.name,
    passwordHash: becrypt.hashSync(req.body.password, 10),
    email: req.body.email,
    street: req.body.street,
    apartment: req.body.apartment,
    city: req.body.city,
    country: req.body.country,
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
  });

  user = await user.save();
  if (!user) {
    return res.status(404).send("The user record wasn't created");
  } else {
    return res.status(201).send(user);
  }
});

//Register new user
router.post(`/register`, async (req, res) => {
  let user = new User({
    name: req.body.name,
    passwordHash: becrypt.hashSync(req.body.password, 10),
    email: req.body.email,
    street: req.body.street,
    apartment: req.body.apartment,
    city: req.body.city,
    country: req.body.country,
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
  });

  user = await user.save();
  if (!user) {
    return res.status(404).send("The user record wasn't created");
  } else {
    return res.status(201).send(user);
  }
});

//Update a user
router.put(`/:id`, async (req, res) => {
  try {
    const userExists = await User.findById(req.params.id);
    let newPassword;
    if (req.body.password) {
      newPassword = becrypt.hashSync(req.body.password, 10);
    } else {
      newPassword = userExists.passwordHash;
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        passwordHash: newPassword,
        email: req.body.email,
        street: req.body.street,
        apartment: req.body.apartment,
        city: req.body.city,
        country: req.body.country,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
      },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    } else {
      return res.status(204).send(user);
    }
  } catch (err) {
    return res.status(400).send(err);
  }
});

//Delete a user
router.delete(`/:id`, async (req, res) => {
  try {
    let user = await User.findByIdAndRemove(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    } else {
      return res
        .status(200)
        .json({ success: true, message: "User deleted" });
    }
  } catch (err) {
    return res.status(400).json({ success: false, error: err });
  }
});

//----Login
router.post("/login", async (req, res) => {
  //Check user exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send("User not found");
  }

  if (user && becrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin
      },
      secret,
      { expiresIn: "1d" }
    );
    return res.status(200).send({ user: user.email, token });
  } else {
    return res.status(400).send("Password is wrong");
  }
});

module.exports = router;
