//Get the environment variables ready
require("dotenv/config");
const api = process.env.API_URL;

//Creating express server
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors =  require('cors');
const authJWT = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');
const app = express();

//Middleware to handle frontend requests
app.use(express.json());
app.use(morgan("tiny"));
app.use(authJWT());
//Making upload folder static
app.use('/public/uploads', express.static(__dirname + '/public/uploads' ))
//Error Handling during authentication
app.use(errorHandler);

//Enable cross origin resource sharing
app.use(cors());
app.options("*",cors());

//Routers
const categoriesRouter = require('./routers/categories');
const ordersRouter = require('./routers/orders');
const productsRouter = require('./routers/products');
const usersRouter = require('./routers/users');

app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/products`, productsRouter);
app.use(`${api}/users`, usersRouter);

//Setting up DB connection
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log("Database connection ready...");
  }).catch((err) => {
    console.log(err);
  });

app.listen(3000, () => {
  console.log("Server is running http://localhost:3000");
});
