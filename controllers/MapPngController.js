var Map = require("../models/MapModel");

exports.getMap = async (req, res) => {
  try {
    console.log(req);
    var data = { msg: "Map png router is working correctly" };

    return res.json({ ok: true, data: data, error: "" });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
};
