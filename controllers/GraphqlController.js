var Map = require("../models/MapModel");
var Estate = require("../models/EstateModel");

var { ORDER_STATUS } = require("../common/const");

exports.getLands = async (req, res) => {
  try {
    var address = req.body.address;

    const ownerParcels = await Map.aggregate([
      { $match: { owner: address } },
      {
        $project: {
          x: "$x",
          y: "$y",
          owner: { address: "$owner" },
          tokenId: "$tokenId",
          updateOperator: null,
          data: null,
          _id: 0,
        },
      },
    ]);
    const ownerEstates = await Estate.aggregate([
      { $match: { estateAddress: address } },
      {
        $project: {
          id: "$estateId",
          owner: { address: "$estateAddress" },
          updateOperator: null,
          _id: 0,
        },
      },
    ]);
    var parcels = [];
    for (var i = 0; i < ownerEstates.length; i++) {
      parcels = []; //initialize
      parcels = await Map.aggregate([
        { $match: { estateId: ownerEstates[i].id } },
        {
          $project: {
            x: 1,
            y: 1,
            tokenId: 1,
            _id: 0,
          },
        },
      ]);
      ownerEstates[i].size = parcels.length;
      ownerEstates[i].parcels = parcels;
    }
    return res.json({
      data: {
        ownerParcels: ownerParcels,
        ownerEstates: ownerEstates,
        updateOperatorParcels: [],
        updateOperatorEstates: [],
        ownerAuthorizations: [],
        operatorAuthorizations: [],
      },
    });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
};
