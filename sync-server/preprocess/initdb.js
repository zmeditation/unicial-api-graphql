const { BigNumber } = require("ethers");

const Map = require("../../models/MapModel");
const { initMap } = require("../../preprocess/initdb");

const { encodeTokenId } = require("../utility/util");
const { ZERO_ADDRESS } = require("../../common/db.const");

async function initMapFromChain(spaceRegistryContract) {
  console.log("Initializing map data including ownership...");
  var spaces = await Map.find().lean();
  console.log(spaces.length);

  if (spaces.length === 0) {
    console.log("- Initializing map data...");
    await initMap();
  }

  console.log("- Getting owner data for each spaces...");
  let updateOps = [];
  for (let i = 0; i < spaces.length; i++) {
    let space = spaces[i];
    // temporily not working with negative xs;
    // SPACERegistry.sol 's encodeTokenId should be upadated soon
    if (space.x < 0) continue;

    let updateOp,
      assetId,
      spaceUpdate,
      isOwnerExist = false;

    // generate assetId if not exist
    if (space.assetId) {
      //do nothing for adding assetId
      assetId = space.assetId;
    } else {
      console.log("x, y: ", space.x, space.y);
      assetId = (
        await spaceRegistryContract.encodeTokenId(space.x, space.y)
      ).toString();

      console.log("encode assetId by s.contract", assetId.toString());
      console.log(
        "encode assetId by javascript",
        encodeTokenId(space.x, space.y).toString()
      );
    }

    // get owners if any
    // isOwnerExist = await spaceRegistryContract.exists(assetId);
    if (space.assetId) {
      if (isOwnerExist) {
        owner = await spaceRegistryContract.ownerOf(assetId);
        spaceUpdate = { ...space, owner: owner };
        // updateOp = {
        //   updateOne: {
        //     filter: { id: space.id },
        //     update: { ...space, owner: owner },
        //     upsert: true,
        //   },
        // };
      }
    } else {
      if (isOwnerExist) {
        owner = await spaceRegistryContract.ownerOf(assetId);
        spaceUpdate = { ...space, tokenId: assetId, owner: owner };
        // updateOp = {
        //   updateOne: {
        //     filter: { id: space.id },
        //     update: { ...space, tokenId: assetId, owner: owner },
        //     upsert: true,
        //   },
        // };
      } else {
        // in case no owner just add assetId
        spaceUpdate = { ...space, tokenId: assetId };
        // updateOp = {
        //   updateOne: {
        //     filter: { id: space.id },
        //     update: { ...space, tokenId: assetId },
        //     upsert: true,
        //   },
        // };
      }
    }

    await Map.updateOne({ id: space.id }, spaceUpdate, {
      upsert: true,
      setDefaultsOnInsert: true,
    });
    // add to bulk operations list
    // updateOps.push(updateOp);
  }

  // await Map.bulkWrite(updateOps, { ordered: false });
}

module.exports = { initMapFromChain };
