var Map = require("../models/MapModel");

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
