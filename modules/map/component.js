const { createCanvas } = require("canvas");

const { TILE_TYPES } = require("../../common/db.const");
const { getViewport } = require("../render/viewport");
const { renderMap } = require("../render/map");
const Map = require("../../models/MapModel");
const { coordsToId } = require("./utils");

const getStream = async (width, height, size, center, selected, showOnSale) => {
  function getColor(tile) {
    switch (tile.type) {
      case TILE_TYPES.DISTRICT:
        return "#5054D4";
      case TILE_TYPES.PLAZA:
        return "#70AC76";
      case TILE_TYPES.ROAD:
        return "#716C7A";
      case TILE_TYPES.OWNED:
        return "#3D3A46";
      case TILE_TYPES.UNOWNED:
        return "#09080A";
    }
  }

  const pan = { x: 0, y: 0 };
  const { nw, se } = getViewport({ width, height, center, size, padding: 1 });
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  const tiles = await getTiles();

  const layer = (x, y) => {
    const id = coordsToId(x, y);
    const tile = tiles[id];
    const result = tile
      ? {
          color:
            showOnSale && tile.price && !isExpired(tile)
              ? "#1FBCFF"
              : getColor(tile),
          top: tile.top,
          left: tile.left,
          topLeft: tile.topLeft,
        }
      : {
          color: (x + y) % 2 === 0 ? "#110e13" : "#0d0b0e",
        };
    return result;
  };

  const layers = [layer];

  // render selected tiles
  if (selected.length > 0) {
    const selection = new Set(
      selected.map((coords) => coordsToId(coords.x, coords.y))
    );
    const strokeLayer = (x, y) =>
      selection.has(coordsToId(x, y)) ? { color: "#ff0044", scale: 1.4 } : null;
    const fillLayer = (x, y) =>
      selection.has(coordsToId(x, y)) ? { color: "#ff9990", scale: 1.2 } : null;
    layers.push(strokeLayer);
    layers.push(fillLayer);
  }

  renderMap({
    ctx,
    width,
    height,
    size,
    pan,
    center,
    nw,
    se,
    layers,
  });

  return canvas.createPNGStream();
};

const getTiles = async () => {
  var mapData = await Map.find({}, { _id: 0, __v: 0 }).lean();
  var result = {};
  for (let i = 0; i < mapData.length; i++) {
    result[mapData[i].id] = mapData[i];
  }
  return result;
};
module.exports = { getStream, getTiles };
