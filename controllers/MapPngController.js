var Map = require("../models/MapModel");
const { extractParams } = require("../utils/filter-params");

exports.getMap = async (req, res) => {
  try {
    const url = req.originalUrl;

    const query = req.query;
    const params = extractParams(query);

    const data = { params: params };

    return res.json({ ok: true, data: params, error: "" });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
};
