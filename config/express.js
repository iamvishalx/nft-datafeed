require("dotenv/config");

const express = require("express");
const cors = require("cors");
const routes = require("../routes/index.routes");
const ApiError = require("../utils/apiError");
const { HttpStatus } = require("../contants");
const { errorConverter, errorHandler } = require("../middlewares/error");

const configureExpress = async (app) => {
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  app.get("/", (req, res, next) => {
    res.status(HttpStatus.OK).send("Welcome to BitsCrunch crypto datafeed application");
  });

  app.use("/api", routes);

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new ApiError(HttpStatus.NOT_FOUND, "Api not found");
    return next(err);
  });

  // convert error to ApiError, if needed
  app.use(errorConverter);

  // handle error
  app.use(errorHandler);
};

module.exports = configureExpress;
