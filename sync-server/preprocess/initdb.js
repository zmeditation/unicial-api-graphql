const Map = require("../../models/MapModel");
const Transfer = require("../../models/TransferModel");
const OrderEvent = require("../../models/OrderEventModel");
const Order = require("../../models/OrderModel");
const BidEvent = require("../../models/BidEventModel");
const Bid = require("../../models/BidModel");
const Estate = require("../../models/EstateModel");
const Space = require("../../models/SpaceModel");
const { initMap } = require("../../preprocess/initdb");

const { encodeTokenId } = require("../utility/util");
const { TILE_TYPES } = require("../../common/db.const");
const { DEPLOY, orderEventName, bidEventName } = require("../const/sync.const");

const {
  EstateProxyAddress,
} = require("../../common/contracts/EstateRegistryContract");

async function initMapWithTokenIds() {
  console.log("*** Initializing map data including ownership...");
  var spaces = await Map.find().lean();
  console.log("- Total spaces count found in maps collection: ", spaces.length);

  if (spaces.length === 0) {
    console.log("- Initializing map data only with (x, y, id)...");
    await initMap();
    console.log("* Done! Initializing map data only with (x, y, id)");
    spaces = await Map.find().lean();
  }

  console.log(
    "- Initializing map data with (tokenId)...\n This may take upto several minutes for the first time"
  );
  for (let i = 0; i < spaces.length; i++) {
    let space = spaces[i];
    let assetId, spaceUpdate;

    // generate assetId if not exist
    if (!space.tokenId) {
      assetId = encodeTokenId(space.x, space.y).toString();
      spaceUpdate = { ...space, tokenId: assetId };
      await Map.updateOne({ id: space.id }, spaceUpdate, {
        upsert: true,
        setDefaultsOnInsert: true,
      });
    }
  }
  console.log("* Done! Initializing map data with (tokenId)");
}

async function initMapByTransferEvent(
  provider,
  spaceRegistryContract,
  filterTransfer,
  SpaceProxyAddress
) {
  console.log(
    "- Synchronizing owner data for each spaces for previous blocks to current block..."
  );
  var latestBlock = await provider.getBlockNumber();
  var from = DEPLOY.SPACE_PROXY_DEPLOY_BLOCK - latestBlock;

  var logsTransfer = await spaceRegistryContract.queryFilter(
    filterTransfer,
    from,
    "latest"
  );

  console.log("- All Transfer counts: ", logsTransfer.length);

  let successCount = 0,
    failedCount = 0,
    txExistCnt = 0,
    txNewCnt = 0;
  for (let i = 0; i < logsTransfer.length; i++) {
    let space;
    var log = logsTransfer[i];
    let blockNumber = log.blockNumber;
    let txHash = log.transactionHash;
    let assetId = log.args.assetId.toString();
    let previousOwner = log.args.from.toString();
    let currentOwner = log.args.to.toString();

    let transfer = await Transfer.findOne({
      $and: [{ txHash: txHash }, { tokenId: assetId }],
    });
    if (transfer) {
      // do nothing if exist previous
      txExistCnt++;
    } else {
      let tr = new Transfer({
        from: previousOwner,
        to: currentOwner,
        tokenId: assetId,
        blockNumber: blockNumber,
        tokenAddress: SpaceProxyAddress,
        txHash: txHash,
      });
      await tr.save();
      txNewCnt++;
    }

    space = await Map.findOne({ tokenId: assetId });
    if (currentOwner !== EstateProxyAddress) {
      space.owner = currentOwner;
      space.name = "";
    }
    if (previousOwner === EstateProxyAddress) {
      space.name = "";
      space.estateId = "";
      space.owner = currentOwner;
    }
    if (space) {
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
        "!!! Can not find space in maps collection for tokenId",
        assetId
      );
    }

    await Space.updateOne(
      { spaceId: assetId },
      {
        spaceId: assetId,
        spaceAddress: currentOwner,
        metaData: "",
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  console.log(
    " * Total transfers from block " +
      DEPLOY.SPACE_PROXY_DEPLOY_BLOCK +
      " to block " +
      latestBlock +
      ": " +
      logsTransfer.length
  );

  console.log(
    " * Existing Transfer events in transfers collection : ",
    txExistCnt
  );
  console.log(" * Newly detected events while syncing : ", txNewCnt++);
}

async function initOrderEventByOrderEvent(
  provider,
  marketplaceContract,
  filterOrderEvent
) {
  var latestBlock = await provider.getBlockNumber();
  var from = DEPLOY.SPACE_PROXY_DEPLOY_BLOCK - latestBlock;

  var logsOrderEvent = await marketplaceContract.queryFilter(
    filterOrderEvent,
    from,
    "latest"
  );
  let orderEventUpdates = [];
  for (let i = 0; i < logsOrderEvent.length; i++) {
    // generate assetId if not exist
    if (orderEventName.includes(logsOrderEvent[i].event)) {
      let orderEventUpdate = {};
      let order = logsOrderEvent[i];
      orderEventUpdate.id = order.args.id;
      orderEventUpdate.eventName = order.event;
      orderEventUpdate.eventParams = {
        assetId: order.args.assetId?.toString(),
        seller: order.args.seller,
        buyer: order.args.buyer,
        nftAddress: order.args.nftAddress,
        priceInWei: order.args.priceInWei?.toString(),
        totalPrice: order.args.totalPrice?.toString(),
        expiresAt: order.args.expiresAt?.toString(),
      };
      orderEventUpdates.push(orderEventUpdate);
    }
  }
  var OrderEventdata = await OrderEvent.find().lean();
  if (OrderEventdata.length === 0) {
    OrderEvent.insertMany(orderEventUpdates);
  } else {
    orderEventUpdates.forEach(async (orderEventUpdate) => {
      await OrderEvent.updateOne(
        { id: orderEventUpdate.id },
        orderEventUpdate,
        {
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );
    });
  }
}

async function initOrderByOrderEvent(
  provider,
  marketplaceContract,
  filterOrder
) {
  var latestBlock = await provider.getBlockNumber();
  var from = DEPLOY.SPACE_PROXY_DEPLOY_BLOCK - latestBlock;

  var logsOrder = await marketplaceContract.queryFilter(
    filterOrder,
    from,
    "latest"
  );

  let orderUpdates = [];
  for (let i = 0; i < logsOrder.length; i++) {
    // generate assetId if not exist
    if (orderEventName.includes(logsOrder[i].event)) {
      let orderUpdate = {};
      let order = logsOrder[i];
      orderUpdate.id = order.args.id;
      orderUpdate.assetId = order.args.assetId?.toString();
      orderUpdate.seller = order.args.seller;
      orderUpdate.nftAddress = order.args.nftAddress;
      if (order.event === "OrderCreated") {
        orderUpdate.priceInWei = order.args.priceInWei?.toString();
        orderUpdate.expiresAt = order.args.expiresAt?.toString();
        orderUpdate.orderStatus = "active";
      }
      if (order.event === "OrderSuccessful") {
        orderUpdate.totalPrice = order.args.totalPrice?.toString();
        orderUpdate.buyer = order.args.buyer;
        orderUpdate.orderStatus = "success";
      }
      if (order.event === "OrderCancelled") orderUpdate.orderStatus = "cancel";
      orderUpdates.push(orderUpdate);
    }
  }

  orderUpdates.forEach(async (orderUpdate) => {
    await Order.updateOne(
      {
        assetId: orderUpdate.assetId,
        seller: orderUpdate.seller,
        nftAddress: orderUpdate.nftAddress,
      },
      orderUpdate,
      {
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );
  });
}

async function initBidEventByBidEvent(provider, BidContract, filterBidEvent) {
  var latestBlock = await provider.getBlockNumber();
  var from = DEPLOY.SPACE_PROXY_DEPLOY_BLOCK - latestBlock;

  var logsBidEvent = await BidContract.queryFilter(
    filterBidEvent,
    from,
    "latest"
  );
  let bidEventUpdates = [];
  for (let i = 0; i < logsBidEvent.length; i++) {
    // generate assetId if not exist
    if (bidEventName.includes(logsBidEvent[i].event)) {
      let bidEventUpdate = {};
      let bid = logsBidEvent[i];
      bidEventUpdate.id = bid.args._id;
      bidEventUpdate.eventName = bid.event;
      bidEventUpdate.eventParams = {
        tokenAddress: bid.args._tokenAddress,
        tokenId: bid.args._tokenId?.toString(),
        bidder: bid.args._bidder,
        seller: bid.args._seller,
        price: bid.args._price?.toString(),
        fee: bid.args._fee?.toString(),
        fingerprint: bid.args._fingerprint,
        expiresAt: bid.args._expiresAt?.toString(),
      };
      bidEventUpdates.push(bidEventUpdate);
    }
  }
  var bidEventdata = await BidEvent.find().lean();
  if (bidEventdata.length === 0) {
    BidEvent.insertMany(bidEventUpdates);
  } else {
    bidEventUpdates.forEach(async (bidEventUpdate) => {
      await BidEvent.updateOne({ id: bidEventUpdate.id }, bidEventUpdate, {
        upsert: true,
        setDefaultsOnInsert: true,
      });
    });
  }
}

async function initBidByBidEvent(provider, BidContract, filterBidEvent) {
  var latestBlock = await provider.getBlockNumber();
  var from = DEPLOY.SPACE_PROXY_DEPLOY_BLOCK - latestBlock;

  var logsBid = await BidContract.queryFilter(filterBidEvent, from, "latest");
  let bidUpdates = [];
  for (let i = 0; i < logsBid.length; i++) {
    // generate assetId if not exist
    if (bidEventName.includes(logsBid[i].event)) {
      let bidUpdate = {};
      let bid = logsBid[i];
      bidUpdate.id = bid.args._id;
      bidUpdate.tokenAddress = bid.args._tokenAddress;
      bidUpdate.tokenId = bid.args._tokenId?.toString();
      bidUpdate.bidder = bid.args._bidder;
      if (bid.event === "BidCreated") {
        bidUpdate.price = bid.args._price?.toString();
        bidUpdate.fingerprint = bid.args._fingerprint;
        bidUpdate.expiresAt = bid.args._expiresAt?.toString();
        bidUpdate.bidStatus = "active";
      } else if (bid.event === "BidAccepted") {
        bidUpdate.seller = bid.args._seller;
        bidUpdate.price = bid.args._price?.toString();
        bidUpdate.fee = bid.args._fee?.toString();
        bidUpdate.bidStatus = "success";
      } else if (bid.event === "BidCancelled") {
        bidUpdate.bidStatus = "cancel";
      }
      bidUpdates.push(bidUpdate);
    }
  }
  bidUpdates.forEach(async (bidUpdate) => {
    await Bid.updateOne({ id: bidUpdate.id }, bidUpdate, {
      upsert: true,
      setDefaultsOnInsert: true,
    });
  });
}

async function initEstateByEstateEvent(
  provider,
  EstateContract,
  filterCreateEstate
) {
  var latestBlock = await provider.getBlockNumber();
  var from = DEPLOY.SPACE_PROXY_DEPLOY_BLOCK - latestBlock;

  var logsCreateEstate = await EstateContract.queryFilter(
    filterCreateEstate,
    from,
    "latest"
  );

  for (let i = 0; i < logsCreateEstate.length; i++) {
    let estateData = logsCreateEstate[i].args;
    await Estate.updateOne(
      { estateId: estateData._estateId.toString() },
      {
        estateId: estateData._estateId.toString(),
        estateAddress: estateData._owner,
        metaData: estateData._data,
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }
}

async function initAddSpaceByAddSpace(
  provider,
  EstateContract,
  filterAddSpace
) {
  var latestBlock = await provider.getBlockNumber();
  var from = DEPLOY.SPACE_PROXY_DEPLOY_BLOCK - latestBlock;

  var logsAddSpace = await EstateContract.queryFilter(
    filterAddSpace,
    from,
    "latest"
  );
  for (let i = 0; i < logsAddSpace.length; i++) {
    let AddSpaceData = logsAddSpace[i].args;
    let space = await Map.findOne({
      tokenId: AddSpaceData._spaceId.toString(),
    });
    let estateData = await Estate.findOne({
      estateId: AddSpaceData._estateId.toString(),
    });
    if (space && estateData) {
      space.owner = estateData.estateAddress;
      space.name = estateData.metaData;
      space.estateId = AddSpaceData._estateId.toString();
      await Map.updateOne(
        { tokenId: AddSpaceData._spaceId.toString() },
        space,
        { upsert: true, setDefaultsOnInsert: true }
      );
    } else {
      console.log(
        "Can not find tokenId Please solve the tokenId encoding issue asap."
      );
    }
  }
}

async function initEstateByEstateTransferEvent(
  provider,
  EstateContract,
  filterEstateTransfer
) {
  var latestBlock = await provider.getBlockNumber();
  var from = DEPLOY.SPACE_PROXY_DEPLOY_BLOCK - latestBlock;

  var logsTransfer = await EstateContract.queryFilter(
    filterEstateTransfer,
    from,
    "latest"
  );

  for (let i = 0; i < logsTransfer.length; i++) {
    let estateLogData = logsTransfer[i].args;
    let estateData = await Estate.findOne({
      estateId: estateLogData.tokenId.toString(),
      estateAddress: estateLogData.from,
    });
    if (estateData) {
      estateData.estateAddress = estateLogData.to;
      await Estate.updateOne(
        {
          estateId: estateData.estateId,
        },
        estateData,
        { upsert: true, setDefaultsOnInsert: true }
      );
      await Map.updateMany(
        { estateId: estateLogData.tokenId.toString() },
        { owner: estateLogData.to },
        { multiple: true },
        (err, writeResult) => {}
      );
    }
  }
}

async function initUpdateEstate(provider, EstateContract, filterUpdate) {
  var latestBlock = await provider.getBlockNumber();
  var from = DEPLOY.SPACE_PROXY_DEPLOY_BLOCK - latestBlock;

  var logsUpdate = await EstateContract.queryFilter(
    filterUpdate,
    from,
    "latest"
  );

  for (let i = 0; i < logsUpdate.length; i++) {
    let estateLogData = logsUpdate[i].args;
    let estateData = await Estate.findOne({
      estateId: estateLogData._assetId.toString(),
    });
    if (estateData) {
      estateData.metaData = estateLogData._data;
      await Estate.updateOne(
        {
          estateId: estateData.estateId,
        },
        estateData,
        { upsert: true, setDefaultsOnInsert: true }
      );
      await Map.updateMany(
        { estateId: estateLogData._assetId.toString() },
        { name: estateLogData._data },
        { multiple: true },
        (err, writeResult) => {}
      );
    }
  }
}

module.exports = {
  initMapWithTokenIds,
  initMapByTransferEvent,
  initOrderEventByOrderEvent,
  initOrderByOrderEvent,
  initBidEventByBidEvent,
  initBidByBidEvent,
  initEstateByEstateEvent,
  initAddSpaceByAddSpace,
  initEstateByEstateTransferEvent,
  initUpdateEstate,
};
