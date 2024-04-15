const express = require("express");
const { getNftByChainIdAndAddress, getMetricsByType } = require("../../controllers/nft.controller");
const { validate } = require("express-validation");
const { urlParamsValidator, urlParamsWithTypeValidator } = require("../../middlewares/validation");

const router = express.Router();

router.get("/:chain_id/:address", validate(urlParamsValidator), getNftByChainIdAndAddress);
router.get(
  "/:chain_id/:address/metrics/:type",
  validate(urlParamsWithTypeValidator),
  getMetricsByType
);

module.exports = router;
