//Initiating router
const express = require("express");
const { Mongoose } = require("mongoose");
const router = express.Router();

//Import the models
const { Order } = require("../models/order");
const { OrderItem } = require("../models/order-item");

//----Getters----

//Get order List
router.get(`/`, async (req, res) => {
  const orderList = await Order.find().populate('user','name').sort({'dateOrdered': -1});
  if (!orderList) {
    return res.status(500).send("No orders found");
  }
  return res.status(200).send(orderList);
});

//Get order 
router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
  .populate('user','name')
  .populate({
    path : 'orderItems',
    populate: {
      path:'product', 
      populate:'category'
    }
  });

  if (!order) {
    return res.status(500).send("No orders found");
  }
  return res.status(200).send(order);
});

//Get total sales
router.get('/get/totalsales', async( req, res) =>{
  const totalSales = await Order.aggregate([
    { $group: { _id: null , totalsales: { $sum : '$totalPrice' } } }
  ])
  if(!totalSales){
    return res.status(400).send("The order sales cannot be generated");
  } else {
    return res.send({totalsales: totalSales.pop().totalsales});
  }
});

//Get total count of orders
router.get('/get/count', async (req, res) => {
  const orderCount = await Order.countDocuments();

  if (!orderCount) {
    res.status(500).json({ success: false });
  }
  res.status(200).send({
    orderCount: orderCount,
  });
});

//Get order list for particular user
router.get(`/get/userorders/:userid`, async (req, res) =>{
  const userOrderList = await Order.find({user: req.params.userid}).populate({ 
      path: 'orderItems', populate: {
          path : 'product', populate: 'category'} 
      }).sort({'dateOrdered': -1});

  if(!userOrderList) {
      res.status(500).json({success: false})
  } 
  res.send(userOrderList);
})


//----Setters----

//Create an order
router.post(`/`, async (req, res)=>{

  const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) =>{
    let newOrderItem = new OrderItem({
      quantity: orderItem.quantity,
      product: orderItem.product
    });

    newOrderItem = await newOrderItem.save();
    return newOrderItem._id;
  }));

  const orderItemsIdsResolved = await orderItemsIds;

  const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId)=>{
    const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
    const totalPrice = orderItem.product.price * orderItem.quantity;
    return totalPrice;
  }));

  const totalPrice = totalPrices.reduce((a,b) => a +b , 0);

  let order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });

  order = await order.save();

  if (!order) {
    return res.status(500).send("The order wasn't created");
  }

  return res.status(200).send(order);
});

//Update the order status
router.put('/:id', async (req, res)=>{

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status
    },
    {new: true}
  )

  if (!order){
    return res.status(400).send('The status cannot be updated.')
  }

  return res.status(200).send(order);

});

//Delete order
router.delete("/:id", async (req, res) => {
  try { 

    Order.findByIdAndRemove(req.params.id).then(async order=>{
      if(order){
        await order.orderItems.map(async orderItem =>{
          await OrderItem.findByIdAndRemove(orderItem)
        });
        return res.status(200).json({ success: true, message: "The order is deleted!" });
      } else {
        return res.status(404).json({ success: false, message: "Order not found!" });  
      }
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});

module.exports = router;
