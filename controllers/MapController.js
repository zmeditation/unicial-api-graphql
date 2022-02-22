var Map = require("../models/MapModel");
var Estate = require("../models/EstateModel");
var Space = require("../models/SpaceModel");

const { OWNERS } = require("../common/mockup.const");
const { randomIntFromInterval } = require("../helpers/utility");

exports.getMap = async (req, res) => {
  try {
    var data = {};
    Map.aggregate([
      {
        $lookup: {
          from: "spaces",
          localField: "tokenId",
          foreignField: "spaceId",
          as: "spaces",
        },
      },
      {
        $unwind: {
          path: "$spaces",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "estates",
          localField: "estateId",
          foreignField: "estateId",
          as: "estates",
        },
      },
      {
        $unwind: {
          path: "$estates",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]).exec(function (err, mapData) {
      for (let i = 0; i < mapData.length; i++) {
        data[mapData[i].id] = {
          type: mapData[i].type,
          top: mapData[i].top,
          left: mapData[i].left,
          topLeft: mapData[i].topLeft,
          x: mapData[i].x,
          y: mapData[i].y,
          id: mapData[i].id,
          tokenId: mapData[i].tokenId,
        };
        if (mapData[i].estateId) {
          data[mapData[i].id].estateId = mapData[i].estateId;
          data[mapData[i].id].owner = mapData[i].estates.estateAddress;
        } else if (mapData[i].spaces) {
          data[mapData[i].id].owner = mapData[i].spaces.spaceAddress;
        }
      }
      return res.json({ ok: true, data: data, error: "" });
    });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
};

// controller to create random owners; not necessary now
exports.addRndOwners = async (req, res) => {
  try {
    var mapData = await Map.find({}, { _id: 0, __v: 0 }).lean();
    var data = {};
    var ownersLength = OWNERS.length;
    var mapUpsertPromises = [];
    for (let i = 0; i < mapData.length; i++) {
      if (i % 2 === 0) {
        let rndOwnerIndex = randomIntFromInterval(0, ownersLength - 1);
        mapUpsertPromises.push(
          Map.updateOne(
            { id: mapData[i].id },
            { ...mapData[i], owner: OWNERS[rndOwnerIndex] }
          )
        );
      }
    }
    await Promise.all(mapUpsertPromises);
    return res.json({ ok: true, data: data, error: "" });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
};

// add owners from smart contract; not necessary now
exports.addOwners = async (req, res) => {
  try {
    var mapData = await Map.find({}, { _id: 0, __v: 0 }).lean();
    var data = {};
    var ownersLength = OWNERS.length;
    var mapUpsertPromises = [];
    for (let i = 0; i < mapData.length; i++) {
      if (i % 2 === 0) {
        let rndOwnerIndex = randomIntFromInterval(0, ownersLength - 1);
        mapUpsertPromises.push(
          Map.updateOne(
            { id: mapData[i].id },
            { ...mapData[i], owner: OWNERS[rndOwnerIndex] }
          )
        );
      }
    }
    await Promise.all(mapUpsertPromises);
    return res.json({ ok: true, data: data, error: "" });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
};
