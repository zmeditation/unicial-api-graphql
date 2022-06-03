function extractParams(query) {
  const parse = (name, defaultValue, minValue, maxValue) => {
    return Math.max(
      Math.min(
        query.hasOwnProperty(name) && !isNaN(parseInt(query[name]))
          ? parseInt(query[name])
          : defaultValue,
        maxValue
      ),
      minValue
    );
  };

  // params
  const width = parse("width", 1024, 100, 4096);

  const height = parse("height", 1024, 100, 4096);
  const size = parse("size", 20, 5, 50);
  console.log("width, height, size: ", width, height, size);

  const [x, y] = query.hasOwnProperty("center")
    ? query["center"].split(",").map((coord) => +coord)
    : [0, 0];
  const center = { x, y };
  const showOnSale = query["on-sale"] === "true";
  const selected = query.hasOwnProperty("selected")
    ? query["selected"].split(";").map((id) => {
        const [x, y] = id.split(",").map((coord) => parseInt(coord));
        return { x, y };
      })
    : [];
  return {
    width,
    height,
    size,
    center,
    showOnSale,
    selected,
  };
}

module.exports = { extractParams };
