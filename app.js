const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const productRouter = require("./productsRoute");

app.use("/productos", productRouter);

exports.app = app;
