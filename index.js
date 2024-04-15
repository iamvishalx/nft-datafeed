const express = require("express");
const configureExpress = require("./config/express");
const configureDatabase = require("./config/mongoose");

const app = express();
const port = process.env.PORT || 3000;

configureExpress(app);
configureDatabase();

app.listen(port, () => {
  console.log(`Server started on ${port}. Available to access on http://localhost:${port}`);
});

module.exports = app;
