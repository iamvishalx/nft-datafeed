/**
 * Custom Error class for handling API-related errors.
 * @param statusCode status code fo the error.
 * @param message custom message for the error.
 * @param stack custom stack trace of the error.
 */
class ApiError extends Error {
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
