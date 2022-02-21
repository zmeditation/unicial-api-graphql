var mongoose = require("mongoose");

var SpaceSchema = new mongoose.Schema({
  spaceId: { type: String, required: true },
  spaceAddress: { type: String, required: true },
  metaData: { type: String },
});

module.exports = mongoose.model("Space", SpaceSchema);
