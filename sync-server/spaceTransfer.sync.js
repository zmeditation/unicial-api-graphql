require("dotenv").config();
const { ethers } = require("ethers");

const Map = require("../models/MapModel");
const Space = require("../models/SpaceModel");
const Transfer = require("../models/TransferModel");

const { initMapByTransferEvent } = require("./preprocess/initdb");

// import constants
const { CHAIN_INFO } = require("../common/const");
const {
  SpaceRegistryAbi,
  SpaceProxyAddress,
} = require("../common/contracts/SpaceRegistryContract");

const { TILE_TYPES } = require("../common/db.const");

// DB connection
var MONGODB_URL = process.env.MONGODB_URL;
var mongoose = require("mongoose");
const {
  EstateProxyAddress,
} = require("../common/contracts/EstateRegistryContract");

mongoose
  .connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    //don't show the log when it is test
    if (process.env.NODE_ENV !== "test") {
      console.log("Connected to %s", MONGODB_URL);
      console.log("Map syncing is running ... \n");
      console.log("Press CTRL + C to stop the process. \n");
    }

    // init provider and contracts
    // should be used for http protocol
    var provider = new ethers.providers.JsonRpcProvider(
      CHAIN_INFO.TESTNET.rpcUrls[0]
    );

    // create contract
    var spaceRegistryContract = new ethers.Contract(
      SpaceProxyAddress,
      SpaceRegistryAbi,
      provider
    );

    var filterSpaceTransfer = spaceRegistryContract.filters.Transfer();

    await initMapByTransferEvent(
      provider,
      spaceRegistryContract,
      filterSpaceTransfer,
      SpaceProxyAddress
    );

    console.log("Listening Transfer event from space registry contract...");
    // Listen to all Transfer events:
    spaceRegistryContract.on("Transfer", async (from, to, assetId, event) => {
      console.log(
        "Transfer occured from " +
          from +
          " to " +
          to +
          " for token " +
          assetId.toString()
      );
      let transfer = await Transfer.findOne({
        txHash: event.transactionHash,
        tokenId: assetId.toString(),
      });
      if (transfer) {
        // do nothing if exist previous
      } else {
        let tr = new Transfer({
          from: from,
          to: to,
          tokenId: assetId.toString(),
          blockNumber: event.blockNumber,
          tokenAddress: event.address,
          txHash: event.transactionHash,
        });
        await tr.save();
      }

      let space = await Map.findOne({ tokenId: assetId.toString() });
      if (space) {
        if (to !== EstateProxyAddress) {
          space.owner = to;
          space.name = "";
          space.estateId = "";
        }
        if (space.type !== TILE_TYPES.PLAZA) {
          space.type = TILE_TYPES.OWNED;
          space.top = false;
          space.left = false;
          space.topLeft = false;
          await Map.findOneAndUpdate(
            { x: space.x + 1, y: space.y },
            { left: false },
            { useFindAndModify: false }
          );
          await Map.findOneAndUpdate(
            { x: space.x, y: space.y - 1 },
            { top: false },
            { useFindAndModify: false }
          );
        }
        space.updatedAt = Math.floor(Date.now() / 1000);
        await Map.updateOne({ tokenId: space.tokenId }, space, {
          upsert: true,
          setDefaultsOnInsert: true,
        });
      } else {
        console.log(
          "Can not find tokenId " +
            tokenId.toString() +
            " Please solve the tokenId encoding issue asap."
        );
      }

      await Space.updateOne(
        { spaceId: assetId.toString() },
        {
          spaceId: assetId.toString(),
          spaceAddress: to,
          metaData: "",
        },
        { upsert: true, setDefaultsOnInsert: true }
      );
    });
  })
  .catch((err) => {
    console.error("Transfer sync server starting error: ", err.message);
    process.exit(1);
  });
