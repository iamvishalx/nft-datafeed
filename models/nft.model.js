const mongoose = require("mongoose");
const ApiError = require("../utils/apiError");
const { HttpStatus } = require("../contants");
const catchAsync = require("../utils/catchAsync");

const NftSchema = new mongoose.Schema(
  {
    chain_id: {
      type: Number,
      index: true,
    },
    address: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
    },
    marketcap: {
      type: Number,
    },
    floorprice: {
      type: Number,
    },
    assets: {
      type: Number,
    },
    image_url: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: "",
    },
    blockchain: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Nft", NftSchema);
