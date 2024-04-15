const mongoose = require("mongoose");
const { migrateRawToDatabase } = require("../controllers/nft.controller");
require("dotenv/config");

const mongoUrl = process.env.MONGO_URI;

const configureDatabase = async () => {
  mongoose
    .connect(mongoUrl)
    .then(async () => {
      console.log(`Successfully connected to ${mongoUrl}`);
      await migrateRawToDatabase();
    })
    .catch((err) => console.error(`Connection to "${mongoUrl}" failed because ${err.message}`));
};

module.exports = configureDatabase;
