var fs = require("fs");
var path = require("path");
const Map = require("../models/MapModel");
const {
  INIT_MAP_TO_TYPE,
  INIT_MAP_TO_TYPE_KEYS,
  TILE_TYPES,
} = require("../common/db.const");

async function initMap() {
  let mapCounts = await Map.countDocuments();
  if (mapCounts > 0) return;

  var data = fs
    .readFileSync(path.join(__dirname, "../data/unicial-map.csv"))
    .toString() // convert Buffer to string
    .split("\n") // split string to lines
    .map((e) => e.trim()) // remove white spaces for each line
    .map((e) => e.split(",").map((e) => e.trim())); // split each line to array

  var mapHeight = data[0].length;
  var mapWidth = data[0].length;
  console.log("mapHeight", mapHeight);
  console.log("mapWidth", mapWidth);
  var halfHeight = Math.floor(mapHeight / 2);
  var halfWidth = Math.floor(mapWidth / 2);

  var maps = [];
  for (let hIndex = 0; hIndex < mapHeight; hIndex++) {
    for (let wIndex = 0; wIndex < mapWidth; wIndex++) {
      if (!INIT_MAP_TO_TYPE_KEYS.includes(data[hIndex][wIndex])) {
        data[hIndex][wIndex] = "-1";
      }
      let map = {};
      x = wIndex - halfWidth;
      y = -hIndex + halfHeight;
      id = x.toString() + "," + y.toString();
      type = INIT_MAP_TO_TYPE[data[hIndex][wIndex]];
      updatedAt = Math.floor(Date.now() / 1000);
      // handle top, left & topLeft for border
      map.top = true;
      map.left = true;
      map.topLeft = true;
      // if ([TILE_TYPES.ROAD, TILE_TYPES.DISTRICT].includes(type)) {
      //   if (
      //     [TILE_TYPES.ROAD, TILE_TYPES.DISTRICT].includes(
      //       INIT_MAP_TO_TYPE[data[hIndex][wIndex]]
      //     )
      //   )
      //     map.top = true;
      //   if (
      //     [TILE_TYPES.ROAD, TILE_TYPES.DISTRICT].includes(
      //       INIT_MAP_TO_TYPE[data[hIndex][wIndex]]
      //     )
      //   )
      //     map.left = true;
      //   map.topLeft = true;
      // }
      map.x = x;
      map.y = y;
      map.id = id;
      map.type = type;
      map.updatedAt = updatedAt;
      maps.push(map);
    }
  }

  await Map.insertMany(maps);
  console.log("Maps collection created with " + maps.length + " cells");
}

module.exports = { initMap };
