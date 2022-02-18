var mongoose = require("mongoose");

var BidEventSchema = new mongoose.Schema({
  id: { type: String, required: true },
  eventName: { type: String, required: true },
  eventParams: { type: Object, required: true },
});

module.exports = mongoose.model("BidEvent", BidEventSchema);
