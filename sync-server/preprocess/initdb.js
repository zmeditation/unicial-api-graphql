const Map = require("../../models/MapModel");
const Transfer = require("../../models/TransferModel");
const { initMap } = require("../../preprocess/initdb");

const { encodeTokenId } = require("../utility/util");
const { TILE_TYPES } = require("../../common/db.const");
const { DEPLOY } = require("../const/sync.const");

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
}
console.log("* Done! Initializing map data with (tokenId)");

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

    console.log(
      "=========================Transfer Item==========================="
    );
    console.log("assetId: ", assetId);
    console.log("previousOwner: ", previousOwner);
    console.log("currentOwner: ", currentOwner);
    console.log(
      "================================================================="
    );

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
    if (space) {
      space.type = TILE_TYPES.OWNED;
      await Map.updateOne(
        { id: space.id },
        {
          space,
          owner: currentOwner,
          type: TILE_TYPES.OWNED,
          updatedAt: Math.floor(Date.now() / 1000),
        }
      );
      successCount++;
    } else {
      failedCount++;
      console.log(
        "!!! Can not find space in maps collection for tokenId",
        assetId
      );
    }
  }
  console.log(
    "* Done! For synchronizing owner data for each spaces for previous blocks to current block"
  );
  console.log(
    "=========================Synchronizing previous Transfers Status==========================="
  );
  console.log(
    " * Total transfers from block " +
      DEPLOY.SPACE_PROXY_DEPLOY_BLOCK +
      " to block " +
      latestBlock +
      ": " +
      logsTransfer.length
  );
  console.log(" * Successfully saved on maps collection : ", successCount);
  console.log(
    " * Failed saving on maps collection as no tokenId found : ",
    failedCount
  );

  // Should do sth if failed exist
  if (failedCount > 0)
    console.log("!!! Checkout assests again and should add them");

  console.log(
    " * Existing Transfer events in transfers collection : ",
    txExistCnt
  );
  console.log(" * Newly detected events while syncing : ", txNewCnt++);
  console.log(
    "============================================================================================"
  );
}

module.exports = { initMapWithTokenIds, initMapByTransferEvent };
