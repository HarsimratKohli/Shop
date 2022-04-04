//Initiating router
const express = require("express");
const router = express.Router();

//Import the models
const { Order } = require("../models/order");
const { OrderItem } = require("../models/order-item");

//----Getters----

//Get order List
router.get(`/`, async (req, res) => {
  const orderList = await Order.find();
  if (!orderList) {
    return res.status(500).send("No orders found");
  }
  return res.status(200).send(orderList);
});

//----Setters----

//Create an order
router.post(`/`, async (req, res)=>{

  const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem =>{
    let newOrderItem = new OrderItem({
      quantity: orderItem.quantity,
      product: orderItem.product
    });

    newOrderItem = await newOrderItem.save();
    return newOrderItem._id;
  }));

  const orderItemsIdsResolved = await orderItemsIds;

  let order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: req.body.totalPrice,
    user: req.body.user,
  });

  order = await order.save();

  if (!order) {
    return res.status(500).send("The order wasn't created");
  }

  return res.status(200).send(order);
});

module.exports = router;
