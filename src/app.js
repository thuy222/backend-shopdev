const compression = require("compression");
const express = require("express");
require("dotenv").config();
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const app = express();

//middlewares
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());

//db
require("./dbs/init.mongodb");

//routes
app.get("/", (req, res, next) => {
  return res.status(200);
});

//handling error

module.exports = app;
