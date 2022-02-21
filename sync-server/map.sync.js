require("dotenv").config();
const { ethers } = require("ethers");

const Map = require("../models/MapModel");
const Transfer = require("../models/TransferModel");

const {
  initMapWithTokenIds,
  initMapByTransferEvent,
} = require("./preprocess/initdb");

// import constants
const { CHAIN_INFO } = require("../common/const");
const {
  SpaceRegistryAddress,
  SpaceRegistryAbi,
  SpaceProxyAddress,
  SpaceProxyAbi,
} = require("../common/contracts/SpaceRegistryContract");
const { TILE_TYPES } = require("../common/db.const");

// DB connection
var MONGODB_URL = process.env.MONGODB_URL;
var mongoose = require("mongoose");

mongoose
  .connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    //don't show the log when it is test
    if (process.env.NODE_ENV !== "test") {
      console.log("Connected to %s", MONGODB_URL);
      console.log("Map syncing is running ... \n");
      console.log("Press CTRL + C to stop the process. \n");
    }

    await initMapWithTokenIds();
  })
  .catch((err) => {
    console.error("Map sync server starting error: ", err.message);
    process.exit(1);
  });
