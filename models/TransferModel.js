var mongoose = require("mongoose");

var TransferSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    tokenId: { type: String, required: true },
    blockNumber: { type: Number, required: true },
    tokenAddress: { type: String, required: true }, // Transferred token address
    txHash: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transfer", TransferSchema);
