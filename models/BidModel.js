var mongoose = require("mongoose");

var BidSchema = new mongoose.Schema({
  id: { type: String, required: true },
  tokenAddress: { type: String, required: true },
  tokenId: { type: String, required: true },
  bidder: { type: String, required: true },
  seller: { type: String, required: true },
  price: { type: String },
  fee: { type: String },
  fingerprint: { type: String },
  expiresAt: { type: String },
  bidStatus: { type: String, required: true },
});

module.exports = mongoose.model("Bid", BidSchema);
