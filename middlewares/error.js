const { HttpStatus } = require("../contants.js");
const ApiError = require("../utils/apiError.js");
const validate = require("express-validation");

/**
 * Middleware to convert various types of errors to a standardized ApiError format.
 * @param {Error} err The error object.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param {NextFunction} next The Express next middleware function.
 */
const errorConverter = (err, req, res, next) => {
  let error = err;
  if (error instanceof validate.ValidationError) {
    error = constructValidationError(error);
  } else if (!(error instanceof ApiError)) {
    error = constructOtherError(error);
  }
  next(error);
};

/**
 * Error handler middleware to send a formatted response for errors.
 * @param {Error} err The error object.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param {NextFunction} next The Express next middleware function.
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode, message, stack = null } = err;

  const response = {
    success: false,
    code: statusCode,
    message,
    stack,
  };

  res.status(statusCode).send(response);
};

/**
 * Constructs an ApiError from a Joi validation error.
 * @param {validate.ValidationError} error The Joi validation error.
 * @returns {ApiError} The constructed ApiError.
 */
const constructValidationError = (error) => {
  // joi validation error contains errors which is an array of error each containing message[]
  const keyNames = Object.keys(error.details);
  let unifiedErrorMessage = `${error.message}: `;
  keyNames.forEach((name) => {
    unifiedErrorMessage += error.details[name].map((er) => er.message).join(" and ");
  });
  error = new ApiError(error.statusCode, unifiedErrorMessage);
  return error;
};

/**
 * Constructs an ApiError from other types of errors.
 * @param {Error} error The error object.
 * @returns {ApiError} The constructed ApiError.
 */
const constructOtherError = (error) => {
  let statusCode = error.statusCode || HttpStatus.BAD_REQUEST;
  let message = error.message || HttpStatus[statusCode];

  error = new ApiError(statusCode, message, error.stack || "");
  return error;
};

module.exports = { errorConverter, errorHandler };
