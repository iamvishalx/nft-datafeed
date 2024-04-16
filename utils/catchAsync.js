/**
 * Wraps an async function to catch any errors and forward them to the next middleware.
 * @param {function} fn - The async function to be wrapped.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

module.exports = catchAsync;
