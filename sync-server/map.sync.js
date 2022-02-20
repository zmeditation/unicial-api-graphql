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

    // init provider and contracts
    // should be used for http protocol
    var provider = new ethers.providers.JsonRpcProvider(
      CHAIN_INFO.TESTNET.rpcUrls[0]
    );

    var spaceRegistryContract = new ethers.Contract(
      SpaceProxyAddress,
      SpaceRegistryAbi,
      provider
    );
    var filterTransfer = spaceRegistryContract.filters.Transfer();
    await initMapByTransferEvent(
      provider,
      spaceRegistryContract,
      filterTransfer,
      SpaceProxyAddress
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
      console.log("event", event);

      let transfer = await Transfer.findOne({
        txHash: event.transactionHash,
        tokenId: event.args.assetId,
      });
      if (transfer) {
        // do nothing if exist previous
      } else {
        let tr = new Transfer({
          from: event.args.from,
          to: event.args.from,
          tokenId: event.args.assetId,
          blockNumber: event.blockNumber,
          tokenAddress: event.address,
          txHash: event.transactionHash,
        });
        await tr.save();
      }

      let space = await Map.findOne({ tokenId: tokenId });
      if (space) {
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
