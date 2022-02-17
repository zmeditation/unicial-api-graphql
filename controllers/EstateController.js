var Map = require("../models/MapModel");

exports.getEstatesByOwner = async (req, res) => {
  try {
    const estateOwner = req.params.owner.toLowerCase();

    // get all parcels that is owned by parcelOwner
    var ownedEstates = await Map.find(
      {
        owner: { $regex: estateOwner, $options: "i" },
        estateId: { $exists: true },
      },
      { _id: 0, __v: 0 }
    ).lean();

    return res.json({ ok: true, data: ownedEstates, error: "" });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
};
