require("dotenv").config();
const { ethers } = require("ethers");

const Bid = require("../models/BidModel");
const BidEvent = require("../models/BidEventModel");

const {
  initBidByBidEvent,
  initBidEventByBidEvent,
} = require("./preprocess/initdb");

// import constants
const { CHAIN_INFO } = require("../common/const");
const {
    BidContractAbi,
    BidContractAddress,
} = require("../common/contracts/BidContract");

// init provider and contracts
// should be used for http protocol
var provider = new ethers.providers.JsonRpcProvider(
  CHAIN_INFO.TESTNET.rpcUrls[0]
);

var BidContract = new ethers.Contract(
    BidContractAddress,
    BidContractAbi,
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
      console.log("BidEvent syncing is running ... \n");
      console.log("Press CTRL + C to stop the process. \n");
    }

    await initBidEventByBidEvent(provider, BidContract, []);
    console.log("End Init BidEvent");

    await initBidByBidEvent(provider, BidContract, []);
    console.log("End Init Bid");

    console.log("Listening Bid event from marketplace contract...");

    BidContract.on(
      "BidCreated",
      async (_id, _tokenAddress, _tokenId, _bidder, _price, _expiresAt, _fingerprint, event) => {
        console.log("--- BidCreated Event occured ---");
        await BidEvent.create({
          id: _id,
          eventName: event.event,
          eventParams: {
            tokenAddress: _tokenAddress,
            tokenId: _tokenId?.toString(),
            bidder: _bidder,
            price: _price?.toString(),
            fingerprint: _fingerprint,
            expiresAt: _expiresAt?.toString(),
          },
        });

        await Bid.updateOne(
          {
            tokenAddress: _tokenAddress,
            tokenId: _tokenId?.toString(),
            bidder: _bidder,
          },
          {
            id: _id,
            tokenAddress: _tokenAddress,
            tokenId: _tokenId?.toString(),
            bidder: _bidder,
            price: _price?.toString(),
            fingerprint: _fingerprint,
            expiresAt: _expiresAt?.toString(),
            orderStatus: "active",
          },
          {
            upsert: true,
            setDefaultsOnInsert: true,
          }
        );
      }
    );
    BidContract.on(
      "BidAccepted",
      async (_id, _tokenAddress, _tokenId, _bidder, _seller, _price, _fee, event) => {
        console.log("--- BidAccepted Event occured ---");
        await BidEvent.create({
          id: _id,
          eventName: event.event,
          eventParams: {
            tokenAddress: _tokenAddress,
            tokenId: _tokenId?.toString(),
            bidder: _bidder,
            price: _price?.toString(),
            seller: _seller,
            fee: _fee,
          },
        });
        await Bid.updateOne(
          {
            tokenAddress: _tokenAddress,
            tokenId: _tokenId?.toString(),
            bidder: _bidder,
          },
          {
            id: _id,
            tokenAddress: _tokenAddress,
            tokenId: _tokenId?.toString(),
            bidder: _bidder,
            price: _price?.toString(),
            seller: _seller,
            fee: _fee,
            orderStatus: "success",
          },
          {
            upsert: true,
            setDefaultsOnInsert: true,
          }
        );
      }
    );
    BidContract.on(
      "BidCancelled",
      async (_id, _tokenAddress, _tokenId, _bidder, event) => {
        console.log("--- BidCancelled Event occured ---");
        await BidEvent.create({
          id: _id,
          eventName: event.event,
          eventParams: {
            tokenAddress: _tokenAddress,
            tokenId: _tokenId?.toString(),
            bidder: _bidder,
          },
        });
        await Bid.updateOne(
          {
            tokenAddress: _tokenAddress,
            tokenId: _tokenId?.toString(),
            bidder: _bidder,
          },
          {
            id: _id,
            tokenAddress: _tokenAddress,
            tokenId: _tokenId?.toString(),
            bidder: _bidder,
            orderStatus: "cancel",
          },
          {
            upsert: true,
            setDefaultsOnInsert: true,
          }
        );
      }
    );
  })
  .catch((err) => {
    console.error("Bid sync server starting error: ", err.message);
    process.exit(1);
  });
