var mongoose = require("mongoose");

var BidSchema = new mongoose.Schema({
  id: { type: String, required: true },
  assetId: { type: String, required: true },
  seller: { type: String, required: true },
  buyer: { type: String },
  nftAddress: { type: String, required: true },
  priceInWei: { type: String },
  totalPrice: { type: String },
  expiresAt: { type: String },
  orderStatus: { type: String, required: true },
});

module.exports = mongoose.model("Order", BidSchema);
