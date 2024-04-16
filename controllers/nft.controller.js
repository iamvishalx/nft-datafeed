require("dotenv/config");
const ApiError = require("../utils/apiError");
const catchAsync = require("../utils/catchAsync");
const rawNftData = require("../rawdata.json");
const models = require("../models/index.models");
const { HttpStatus, getSelectedKeysForNft } = require("../contants");

const migrateAutomatically = process.env.SHOULD_MIGRATE_AUTOMATICALLY || false;

/**
 * Migrates raw NFT data to the database if migration is allowed and raw data is available.
 */
const migrateRawToDatabase = async () => {
  console.log("Inside Migration");

  if (!rawNftData || !Array.isArray(rawNftData) || rawNftData.length === 0) {
    console.error("No raw data found for migration");
    return;
  }

  if (!migrateAutomatically || migrateAutomatically !== "true") {
    console.error("Migration not allowed. Exiting...");
    return;
  }

  const existingNftDocumentsCount = await models.nftSchema.countDocuments();

  console.log(
    "Raw data:",
    rawNftData.length,
    "Existing data:",
    existingNftDocumentsCount,
    "should migrate?:",
    migrateAutomatically
  );

  if (rawNftData.length > existingNftDocumentsCount) {
    try {
      const bulkOperation = rawNftData.map((data) => ({
        insertOne: {
          document: data,
        },
      }));

      const res = await models.nftSchema.bulkWrite(bulkOperation);

      console.log("Migration Completed", {
        isOk: res.isOk(),
        inserted: res.insertedCount,
        check: res.toString(),
      });
    } catch (error) {
      console.error("Migration Failed", error);
    }
    return;
  }
};

/**
 * Finds an NFT document by its chain_id and etheruem address.
 * @param {string} chain_id The chain_id of the NFT document.
 * @param {string} address The eth address of the NFT document.
 * @param {string[]} select Optional. Array of keys to select from the document.
 * @returns {Promise<Object|null>} A Promise that resolves to the found NFT document or null if not found.
 */
const findByChainIdAndAddress = async (chain_id, address, select) => {
  try {
    console.log("address", address, "chain id", chain_id);
    const nft = await models.nftSchema.findOne({ chain_id, address }).select(select);
    if (!nft) return null;
    return nft;
  } catch (error) {
    console.log("Find By Chain Id And Address error", error);
    return null;
  }
};

/**
 * Controller fn to handle requests to get an NFT document by chain_id and eth address.
 */
const getNftByChainIdAndAddress = catchAsync(async (req, res, next) => {
  const chain_id = req.params.chain_id;
  const address = req.params.address;

  const nft = await findByChainIdAndAddress(chain_id, address, getSelectedKeysForNft(null));

  if (!nft) throw new ApiError(HttpStatus.NOT_FOUND, "No data found");
  return res.status(HttpStatus.OK).send({ success: true, data: nft });
});

/**
 * Controller fn to handle requests to get specific metrics of an NFT document by chain ID, address, and metric name.
 */
const getMetricsByName = catchAsync(async (req, res, next) => {
  const chain_id = req.params.chain_id;
  const address = req.params.address;
  const metric_name = req.params.metric_name;

  const nft = await findByChainIdAndAddress(chain_id, address, getSelectedKeysForNft(metric_name));

  if (!nft) throw new ApiError(HttpStatus.NOT_FOUND, "No data found");
  return res
    .status(HttpStatus.OK)
    .send({ success: true, data: { metric_name: metric_name, value: nft[metric_name] } });
});

module.exports = {
  migrateRawToDatabase,
  findByChainIdAndAddress,
  getNftByChainIdAndAddress,
  getMetricsByName,
};
