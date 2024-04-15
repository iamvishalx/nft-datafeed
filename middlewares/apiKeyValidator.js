const { HttpStatus } = require("../contants");
const ApiError = require("../utils/apiError");

require("dotenv/config");

const apiKeyValidator = (req, res, next) => {
  const apiKey = req.headers["x-api-key"] || null;

  if (!apiKey || apiKey !== process.env.API_KEY) {
    throw new ApiError(HttpStatus.UNAUTHORIZED, "Invalid API KEY");
  }
  next();
};

module.exports = apiKeyValidator;
