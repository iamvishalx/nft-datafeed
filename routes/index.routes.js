const express = require("express");
const { HttpStatus } = require("../contants");
const apiKeyValidator = require("../middlewares/apiKeyValidator");
const v1Routes = require("./v1/index");

const router = express.Router();

// Health check route to verify server status
router.get("/health-check", (req, res) => res.status(HttpStatus.OK).send("OK"));

// Redirect v1 endpoint requests to v1Routes folder
router.use("/v1", apiKeyValidator, v1Routes);

module.exports = router;
