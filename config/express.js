require("dotenv/config");

const express = require("express");
const cors = require("cors");
const routes = require("../routes/index.routes");
const ApiError = require("../utils/apiError");
const { HttpStatus } = require("../contants");
const { errorConverter, errorHandler } = require("../middlewares/error");

const configureExpress = async (app) => {
  app
    .use(cors())
    .use(express.json({ limit: "10mb" }))
    .get("/", (req, res, next) => {
      res.status(HttpStatus.OK).send("Welcome to BitsCrunch datafeed application");
    })
    .use("/api", routes)
    .use((req, res, next) => {
      const err = new ApiError(HttpStatus.NOT_FOUND, "Api not found");
      return next(err);
    })
    .use(errorConverter)
    .use(errorHandler);
};

module.exports = configureExpress;
