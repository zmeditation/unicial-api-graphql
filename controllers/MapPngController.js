const { createCanvas } = require("canvas");

const { extractParams } = require("../helpers/filter-params");
const { getStream } = require("../modules/map/component");

exports.getMap = async (req, res) => {
  try {
    const query = req.query;
    const { width, height, size, center, selected, showOnSale } =
      extractParams(query);

    const stream = await getStream(
      width,
      height,
      size,
      center,
      selected,
      showOnSale
    );

    res.type("png");
    stream.pipe(res);
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
};
