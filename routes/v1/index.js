const express = require("express");
const nftRoutes = require("./nft.route");

const router = express.Router();

router.use(nftRoutes);

module.exports = router;
