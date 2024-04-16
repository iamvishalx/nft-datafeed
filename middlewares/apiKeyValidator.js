require("dotenv/config");
const { HttpStatus } = require("../contants");
const ApiError = require("../utils/apiError");

const API_KEY = process.env.API_KEY || null;

/**
 * Middleware to validate the API key sent in the request headers.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param {NextFunction} next The Express next middleware function.
 */
const apiKeyValidator = (req, res, next) => {
  const apiKey = req.headers["x-api-key"] || null;

  if (!apiKey || apiKey !== API_KEY) {
    throw new ApiError(HttpStatus.UNAUTHORIZED, "Invalid API KEY");
  }
  next();
};

module.exports = apiKeyValidator;
