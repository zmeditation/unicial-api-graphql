var Map = require("../models/MapModel");

exports.getMap = async (req, res) => {
  try {
    var mapData = await Map.find({}, { _id: 0, __v: 0 }).lean();
    var data = {};
    for (let i = 0; i < mapData.length; i++) {
      const { id, ...rest } = mapData[i];
      data[mapData[i].id] = rest;
    }
    return res.json({ success: true, data: data, error: "" });
  } catch (err) {
    return res.json({ success: false, error: err.message });
  }
};
