require("dotenv").config();
const { ethers } = require("ethers");

const Map = require("../models/MapModel");

const {
  initMapWithTokenIds,
  initMapByTransferEvent,
} = require("./preprocess/initdb");

// import constants
const { CHAIN_INFO } = require("../common/const");
const {
  SpaceRegistryAddress,
  SpaceRegistryOptimizeAbi,
  SpaceProxyAddress,
  SpaceProxyAbi,
} = require("../common/contracts/SpaceRegistryContract");
const { TILE_TYPES } = require("../common/db.const");

// init provider and contracts
// should be used for http protocol
var provider = new ethers.providers.JsonRpcProvider(
  CHAIN_INFO.TESTNET.rpcUrls[0]
);

var spaceRegistryContract = new ethers.Contract(
  SpaceProxyAddress,
  SpaceRegistryOptimizeAbi,
  provider
);

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
    var filterTransfer = spaceRegistryContract.filters.Transfer();
    await initMapByTransferEvent(
      provider,
      spaceRegistryContract,
      filterTransfer
    );

    console.log("Listening Transfer event from space registry contract...");
    // Listen to all Transfer events:
    spaceRegistryContract.on("Transfer", async (from, to, tokenId, event) => {
      console.log(
        "Transfer occured from " +
          from +
          " to " +
          to +
          " for token " +
          tokenId.toString()
      );
      let space = await Map.findOne({ tokenId: tokenId });
      if (space) {
        console.log(space);
        space.type = TILE_TYPES.OWNED;
        await Map.updateOne(
          { id: space.id },
          {
            space,
            owner: to,
            type: TILE_TYPES.OWNED,
            updatedAt: Math.floor(Date.now() / 1000),
          }
        );
      } else {
        console.log(
          "Can not find tokenId " +
            tokenId.toString() +
            " Please solve the tokenId encoding issue asap."
        );
      }
    });
  })
  .catch((err) => {
    console.error("Map sync server starting error: ", err.message);
    process.exit(1);
  });
