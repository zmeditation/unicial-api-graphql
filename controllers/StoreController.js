var Order = require("../models/OrderModel");
var Bid = require("../models/BidModel");
var {
  SpaceProxyAddress,
} = require("../common/contracts/SpaceRegistryContract");
var { ORDER_STATUS } = require("../common/const");
var { decodeTokenId } = require("../sync-server/utility/util");

exports.getActiveParcels = async (req, res) => {
  try {
    var currentDate = new Date();
    var currentTimestamp = currentDate.getTime() / 1000;
    const activeOrders = await Order.find(
      {
        $and: [
          { nftAddress: SpaceProxyAddress },
          { orderStatus: ORDER_STATUS.active },
          { expiresAt: { $gte: currentTimestamp } },
        ],
      },
      { _id: 0, __v: 0, orderStatus: 0 }
    ).lean();
    const activeParcels = {};
    activeOrders.forEach((activeOrder) => {
      var { x, y } = decodeTokenId(activeOrder.assetId);
      var key = `${x.toString()},${y.toString()}`;
      activeOrder.x = Number(x);
      activeOrder.y = Number(y);
      activeParcels[key] = activeOrder;
    });
    return res.json({ ok: true, data: activeParcels, error: "" });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
};

exports.getActiveBids = async (req, res) => {
  try {
    var currentDate = new Date();
    var currentTimestamp = currentDate.getTime() / 1000;
    const activeBids = await Bid.find(
      {
        $and: [
          { orderStatus: ORDER_STATUS.active },
          { expiresAt: { $gte: currentTimestamp } },
        ],
      },
      { _id: 0, __v: 0, bidStatus: 0 }
    ).lean();
    return res.json({ ok: true, data: activeBids, error: "" });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
};