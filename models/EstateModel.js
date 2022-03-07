var mongoose = require("mongoose");

var EstateSchema = new mongoose.Schema({
  estateId: { type: String, required: true },
  estateAddress: { type: String, required: true },
  metaData: { type: String },
});

module.exports = mongoose.model("Estate", EstateSchema);
