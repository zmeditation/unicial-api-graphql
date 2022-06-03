const SEPARATOR = ",";

function coordsToId(x, y) {
  return x + SEPARATOR + y;
}

module.exports = { SEPARATOR, coordsToId };
