const express = require("express");
const configureExpress = require("./config/express");
const configureDatabase = require("./config/mongoose");
const configureSocket = require("./config/socket");

const app = express();
const port = process.env.PORT || 3000;

// Http Server Configuration
configureExpress(app);
configureDatabase();

const server = app.listen(port, () => {
  console.log(`Server started on ${port}. Available to access on http://localhost:${port}`);
});

// Socket server configuration
configureSocket(server);

module.exports = app;
