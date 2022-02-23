require("dotenv").config();
const { ethers } = require("ethers");
const Estate = require("../models/EstateModel");
const Map = require("../models/MapModel");
const {
  initEstateByEstateEvent,
  initAddSpaceByAddSpace,
  initEstateByEstateTransferEvent,
} = require("./preprocess/initdb");
const { CHAIN_INFO } = require("../common/const");
const {
  EstateRegistryAbi,
  EstateProxyAddress,
} = require("../common/contracts/EstateRegistryContract");

// init provider and contracts
// should be used for http protocol
var provider = new ethers.providers.JsonRpcProvider(
  CHAIN_INFO.TESTNET.rpcUrls[0]
);

var EstateContract = new ethers.Contract(
  EstateProxyAddress,
  EstateRegistryAbi,
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
      console.log("EstateCreate Event syncing is running ... \n");
      console.log("Press CTRL + C to stop the process. \n");
    }

    var filterCreateEstate = EstateContract.filters.CreateEstate();
    var filterAddSpace = EstateContract.filters.AddSpace();
    var filterTransfer = EstateContract.filters.Transfer();

    await initEstateByEstateEvent(provider, EstateContract, filterCreateEstate);
    console.log("End Init Estate Create");

    await initAddSpaceByAddSpace(provider, EstateContract, filterAddSpace);
    console.log("Added EstateId to Map");

    await initEstateByEstateTransferEvent(
      provider,
      EstateContract,
      filterTransfer
    );
    console.log("Added EstateId for transfer");

    console.log(
      "Listening Estate Create event, AddSpace, Transfer Estate from EstateRegistry contract..."
    );

    // Listening CreateEstate event of EstateContract
    EstateContract.on("CreateEstate", async (_owner, _estateId, _data) => {
      console.log("--- CreateEstate Event occured ---");
      await Estate.updateOne(
        { estateId: _estateId.toString() },
        {
          estateId: _estateId.toString(),
          estateAddress: _owner,
          metaData: _data,
        },
        { upsert: true, setDefaultsOnInsert: true }
      );
    });

    // Listening AddSpace event of EstateContract
    EstateContract.on("AddSpace", async (_estateId, _spaceId) => {
      console.log("--- AddSpace Event occured ---");
      let space = await Map.findOne({
        tokenId: _spaceId.toString(),
      });
      if (space) {
        await Map.updateOne(
          { tokenId: _spaceId.toString() },
          {
            space,
            estateId: _estateId.toString(),
          }
        );
      } else {
        console.log(
          "Can not find tokenId Please solve the tokenId encoding issue asap."
        );
      }
    });

    // Listening Transfer event of EstateContract
    EstateContract.on("Transfer", async (from, to, tokenId) => {
      console.log("--- TransferEstate Event occured ---");

      let estateData = await Estate.findOne({
        estateId: tokenId.toString(),
        estateAddress: from,
      });

      if (estateData) {
        await Estate.updateOne(
          {
            estateId: estateData.estateId,
            estateAddress: estateData.estateAddress,
            metaData: estateData.metaData,
          },
          {
            estateData,
            estateAddress: to,
          },
          { upsert: true, setDefaultsOnInsert: true }
        );
      }
    });
  })
  .catch((err) => {
    console.error("Estate sync server starting error: ", err.message);
    process.exit(1);
  });
