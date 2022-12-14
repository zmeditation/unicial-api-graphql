require("dotenv").config();
const { ethers } = require("ethers");
const Estate = require("../models/EstateModel");
const Map = require("../models/MapModel");
const {
  initEstateByEstateEvent,
  initAddSpaceByAddSpace,
  initEstateByEstateTransferEvent,
  initUpdateEstate,
} = require("./preprocess/initdb");
const { CHAIN_INFO } = require("../common/const");
const {
  EstateRegistryAbi,
  EstateProxyAddress,
} = require("../common/contracts/EstateRegistryContract");
const { emptyAddress } = require("./const/sync.const");
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
    var filterUpdate = EstateContract.filters.Update();

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

    await initUpdateEstate(provider, EstateContract, filterUpdate);
    console.log("Updated Estate");

    console.log(
      "Listening Estate Create event, AddSpace, Transfer Estate from EstateRegistry contract..."
    );

    // Listening CreateEstate event of EstateContract
    EstateContract.on("CreateEstate", async (_owner, _estateId, _data) => {
      console.log(
        `--- CreateEstate Event occured by ${_owner} estateId ${_estateId} data ${_data} ---`
      );
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
      let estateData = null;
      do {
        estateData = await Estate.findOne({
          estateId: _estateId.toString(),
        });
        if (space && estateData) {
          space.owner = estateData.estateAddress;
          space.name = estateData.metaData;
          space.estateId = _estateId.toString();
          await Map.updateOne({ tokenId: _spaceId.toString() }, space);
        } else {
          estateData = null;
          console.log(
            "Can not find tokenId Please solve the tokenId encoding issue asap."
          );
        }
      } while (estateData === null);
    });

    // Listening Transfer event of EstateContract
    EstateContract.on("Transfer", async (from, to, tokenId) => {
      console.log(
        `---Estate Transfer Event occured from ${from} to ${to} tokenId ${tokenId.toString()} ---`
      );

      let estateData = await Estate.findOne({
        estateId: tokenId.toString(),
        estateAddress: from,
      });
      if (estateData) {
        estateData.estateAddress = to;
        await Estate.updateOne(
          {
            estateId: tokenId.toString(),
          },
          estateData,
          { upsert: true, setDefaultsOnInsert: true }
        );
        await Map.updateMany(
          { estateId: tokenId.toString() },
          { owner: to },
          { multiple: true },
          (err, writeResult) => {}
        );
      } else if (from === emptyAddress) {
        console.log("This is create Transfer Event by 0x000000000000");
        await Map.updateMany(
          { estateId: tokenId.toString() },
          { owner: to },
          { multiple: true },
          (err, writeResult) => {}
        );
      } else {
        console.log(
          "There is no Estate in Estate collection when the Transfer event occured."
        );
      }
    });

    // Listening Update event of EstateContract
    EstateContract.on("Update", async (_assetId, _holder, _operator, _data) => {
      console.log(
        `---Estate Update Event occured from Estate id ${_assetId.toString()}, metadata is ${_data} ---`
      );

      let estateData = await Estate.findOne({
        estateId: _assetId.toString(),
      });
      if (estateData) {
        estateData.metaData = _data;
        await Estate.updateOne(
          {
            estateId: _assetId.toString(),
          },
          estateData,
          { upsert: true, setDefaultsOnInsert: true }
        );
        await Map.updateMany(
          { estateId: _assetId.toString() },
          { name: _data },
          { multiple: true },
          (err, writeResult) => {}
        );
      } else {
        console.log(
          "There is no Estate in Estate collection when the Update event occured."
        );
      }
    });
  })
  .catch((err) => {
    console.error("Estate sync server starting error: ", err.message);
    process.exit(1);
  });
