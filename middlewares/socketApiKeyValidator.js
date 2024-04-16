require("dotenv/config");

const API_KEY = process.env.API_KEY || null;

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
