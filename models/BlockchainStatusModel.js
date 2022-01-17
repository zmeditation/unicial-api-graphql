var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var BlockchainStatusSchema = new Schema(
  {
    id: { type: Number, required: true },
    syncno: { type: Number, required: true },
    space_proxy_address: { type: Object, required: true },
    space_registry_addresses: { type: Array, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BlockchainStatus", BlockchainStatusSchema);
