//Get the environment variables ready
require("dotenv/config");
const api = process.env.API_URL;

//Creating express server
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const app = express();

//Middleware to handle frontend requests
app.use(express.json());
app.use(morgan("tiny"));

//Routers
const productsRouter = require('./routers/products');
app.use(`${api}/products`, productsRouter);

//Setting up DB connection
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connection ready...");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(3000, () => {
  console.log("server is running http://localhost:3000");
});
