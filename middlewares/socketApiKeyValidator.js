require("dotenv/config");

const API_KEY = process.env.API_KEY || null;

/**
 * Middleware to validate the API key sent in the WebSocket request headers.
 * @param {Request} req The HTTP request object.
 * @param {Socket} socket The WebSocket socket object.
 */
const validateSocketApiKeyMiddleware = (req, socket) => {
  const headerApiKey = req.headers["x-api-key"] || null;

  if (!headerApiKey || headerApiKey !== API_KEY) {
    socket.write("HTTP/1.1 401 Unauthorized \r\n\r\n");
    socket.destroy(new Error("Not Authorised"));
    return;
  }
  return;
};

module.exports = validateSocketApiKeyMiddleware;
