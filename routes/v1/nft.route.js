const express = require("express");
const { getNftByChainIdAndAddress, getMetricsByName } = require("../../controllers/nft.controller");
const { validate } = require("express-validation");
const {
  urlParamsValidator,
  urlParamsWithMetricNameValidator,
} = require("../../middlewares/validation");

const router = express.Router();

router.get("/:chain_id/:address", validate(urlParamsValidator), getNftByChainIdAndAddress);

router.get(
  "/:chain_id/:address/metrics/:metric_name",
  validate(urlParamsWithMetricNameValidator),
  getMetricsByName
);

module.exports = router;
