const { BigNumber, ethers } = require("ethers");

const Map = require("../../models/MapModel");
const { initMap } = require("../../preprocess/initdb");

const { encodeTokenId } = require("../utility/util");
const { ZERO_ADDRESS, TILE_TYPES } = require("../../common/db.const");
const { DEPLOY } = require("../const/sync.const");

async function initMapFromChain(spaceRegistryContract) {
  console.log("Initializing map data including ownership...");
  var spaces = await Map.find().lean();
  console.log(spaces.length);

  if (spaces.length === 0) {
    console.log("- Initializing map data...");
    await initMap();
  }

  for (let i = 0; i < spaces.length; i++) {
    let space = spaces[i];
    // temporily not working with negative xs;
    // SPACERegistry.sol 's encodeTokenId should be upadated soon

    let assetId, spaceUpdate;

    // generate assetId if not exist
    if (!space.tokenId) {
      console.log("x, y: ", space.x, space.y);
      // assetId = (
      //   await spaceRegistryContract.encodeTokenId(space.x, space.y)
      // ).toString();

      assetId = encodeTokenId(Math.abs(space.x), Math.abs(space.y)).toString();
      spaceUpdate = { ...space, tokenId: assetId };
      await Map.updateOne({ id: space.id }, spaceUpdate, {
        upsert: true,
        setDefaultsOnInsert: true,
      });
    }
  }
}

async function initMapByTransferEvent(
  provider,
  spaceRegistryContract,
  filterTransfer
) {
  console.log("- Getting owner data for each spaces...");
  var latestBlock = await provider.getBlockNumber();
  var from = DEPLOY.SPACE_PROXY_DEPLOY_BLOCK - latestBlock;

  var logsTransfer = await spaceRegistryContract.queryFilter(
    filterTransfer,
    from,
    "latest"
  );

  console.log("All Transfer counts: ", logsTransfer.length);

  let count = 0;
  for (let i = 0; i < logsTransfer.length; i++) {
    let space;

    var log = logsTransfer[i];
    let assetId = log.args.assetId.toString();
    let currentOwner = log.args.to.toString();
    console.log("assetId", assetId);
    console.log("currentOwner", currentOwner);

    space = await Map.findOne({ tokenId: assetId });
    if (space) {
      console.log(space);
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
      count++;
    }
  }
  console.log("Exactyl registered token transfer counts: ", count);
}

module.exports = { initMapFromChain, initMapByTransferEvent };
