var Map = require("../models/MapModel");
const { createCanvas } = require("canvas");

const { getStream } = require("../modules/map/component");

exports.getMap = async (req, res) => {
  try {
    const query = req.query;
    const x = req.params.x;
    const y = req.params.y;
    const selected = [{ x: x, y: y }];
    const center = { x: x, y: y };

    const stream = await getStream(1024, 1024, 20, center, selected, false);

    res.type("png");
    stream.pipe(res);
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
};

exports.getParcelsByOwner = async (req, res) => {
  try {
    const parcelOwner = req.params.owner.toLowerCase();

    // get all parcels that not including estateId
    var ownedParcels = await Map.find(
      {
        owner: { $regex: parcelOwner, $options: "i" },
        estateId: { $exists: false },
      },
      { _id: 0, __v: 0 }
    ).lean();

    return res.json({ ok: true, data: ownedParcels, error: "" });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
};
