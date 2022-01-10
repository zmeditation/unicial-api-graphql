var mongoose = require("mongoose");

const { TILE_TYPES } = require("../common/db.const");

var MapSchema = new mongoose.Schema({
  id: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  type: {
    type: String,
    required: true,
    enum: [
      TILE_TYPES.OWNED,
      TILE_TYPES.UNOWNED,
      TILE_TYPES.PLAZA,
      TILE_TYPES.ROAD,
      TILE_TYPES.DISTRICT,
    ],
    default: TILE_TYPES.UNOWNED,
  },
  top: { type: Boolean, required: true, default: false }, // false: border exist, true: no-border for top & bottom
  left: { type: Boolean, required: true, default: false }, // false: border exist, true: no-border left & right
  topLeft: { type: Boolean, required: true, default: false }, // false: border exist, true: no-border vertex
  updatedAt: { type: Number, required: true },
  name: { type: String },
  owner: { type: String },
  estateId: { type: String },
  tokenId: { type: String },
  price: { type: Number },
});

module.exports = mongoose.model("Map", MapSchema);
