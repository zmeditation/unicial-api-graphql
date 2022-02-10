require("dotenv").config();
const { ethers } = require("ethers");

const Order = require("../models/OrderModel");
const OrderEvent = require("../models/OrderEventModel");

const {
  initOrderByOrderEvent,
  initOrderEventByOrderEvent,
} = require("./preprocess/initdb");

// import constants
const { CHAIN_INFO } = require("../common/const");
const {
  MarketplaceAbi,
  MarketplaceAddress,
} = require("../common/contracts/MarketPlaceContract");

// init provider and contracts
// should be used for http protocol
var provider = new ethers.providers.JsonRpcProvider(
  CHAIN_INFO.TESTNET.rpcUrls[0]
);

var marketplaceContract = new ethers.Contract(
  MarketplaceAddress,
  MarketplaceAbi,
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
      console.log("OrderEvent syncing is running ... \n");
      console.log("Press CTRL + C to stop the process. \n");
    }

    var filterOrderCreated = marketplaceContract.filters.OrderCreated();
    var filterOrderSuccessful = marketplaceContract.filters.OrderSuccessful();
    var filterOrderCanceled = marketplaceContract.filters.OrderCancelled();

    const filter = [
      filterOrderCreated,
      filterOrderSuccessful,
      filterOrderCanceled,
    ];
    await initOrderEventByOrderEvent(provider, marketplaceContract, filter);
    console.log("End Init OrderEvent by OrderCreated");

    await initOrderByOrderEvent(provider, marketplaceContract, filter);
    console.log("End Init Order by OrderCreated");

    console.log("Listening Order event from marketplace contract...");

    marketplaceContract.on(
      "OrderCreated",
      async (id, assetId, seller, nftAddress, priceInWei, expiresAt, event) => {
        console.log("--- OrderCreated Event occured ---");
        await OrderEvent.create({
          id: id,
          eventName: event.event,
          eventParams: {
            assetId: assetId?.toString(),
            seller: seller,
            nftAddress: nftAddress,
            priceInWei: priceInWei?.toString(),
            expiresAt: expiresAt?.toString(),
          },
        });

        await Order.updateOne(
          {
            assetId: assetId?.toString(),
            seller: seller,
            nftAddress: nftAddress,
          },
          {
            id: id,
            assetId: assetId?.toString(),
            seller: seller,
            nftAddress: nftAddress,
            priceInWei: priceInWei?.toString(),
            expiresAt: expiresAt?.toString(),
            orderStatus: "active",
          },
          {
            upsert: true,
            setDefaultsOnInsert: true,
          }
        );
      }
    );
    marketplaceContract.on(
      "OrderSuccessful",
      async (id, assetId, seller, nftAddress, totalPrice, buyer, event) => {
        console.log("--- OrderSuccessful Event occured ---");
        await OrderEvent.create({
          id: id,
          eventName: event.event,
          eventParams: {
            assetId: assetId?.toString(),
            seller: seller,
            buyer: buyer,
            nftAddress: nftAddress,
            totalPrice: totalPrice?.toString(),
          },
        });
        await Order.updateOne(
          {
            assetId: assetId?.toString(),
            seller: seller,
            nftAddress: nftAddress,
          },
          {
            id: id,
            assetId: assetId?.toString(),
            seller: seller,
            nftAddress: nftAddress,
            totalPrice: totalPrice?.toString(),
            buyer: buyer,
            orderStatus: "success",
          },
          {
            upsert: true,
            setDefaultsOnInsert: true,
          }
        );
      }
    );
    marketplaceContract.on(
      "OrderCancelled",
      async (id, assetId, seller, nftAddress, event) => {
        console.log("--- OrderCancelled Event occured ---");
        await OrderEvent.create({
          id: id,
          eventName: event.event,
          eventParams: {
            assetId: assetId?.toString(),
            seller: seller,
            nftAddress: nftAddress,
          },
        });
        await Order.updateOne(
          {
            assetId: assetId?.toString(),
            seller: seller,
            nftAddress: nftAddress,
          },
          {
            id: id,
            assetId: assetId?.toString(),
            seller: seller,
            nftAddress: nftAddress,
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
    console.error("Order sync server starting error: ", err.message);
    process.exit(1);
  });
