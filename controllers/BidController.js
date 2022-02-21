var Bid = require("../models/BidModel");

var { ORDER_STATUS } = require("../common/const");

exports.getAllBids = async (req, res) => {
  try {
    const allBids = await Bid.find({}, { _id: 0, __v: 0, bidStatus: 0 }).lean();
    return res.json({ ok: true, data: allBids, error: "" });
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
          { bidStatus: ORDER_STATUS.active },
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

exports.getBidsByBidder = async (req, res) => {
  try {
    bidder = req.params.bidder;
    const bids = await Bid.find(
      {
        $and: [{ bidder: { $regex: new RegExp(`^${bidder}$`, "i") } }],
      },
      { _id: 0, __v: 0, bidStatus: 0 }
    ).lean();
    return res.json({ ok: true, data: bids, error: "" });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
};

exports.getActiveBidsByBidder = async (req, res) => {
  try {
    bidder = req.params.bidder;
    var currentDate = new Date();
    var currentTimestamp = currentDate.getTime() / 1000;

    const activeBidsByBidder = await Bid.find(
      {
        $and: [
          { bidder: { $regex: new RegExp(`^${bidder}$`, "i") } },
          { bidStatus: ORDER_STATUS.active },
          { expiresAt: { $gte: currentTimestamp } },
        ],
      },
      { _id: 0, __v: 0, bidStatus: 0 }
    ).lean();
    return res.json({ ok: true, data: activeBidsByBidder, error: "" });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
};

exports.getExpiredBidsByBidder = async (req, res) => {
  try {
    bidder = req.params.bidder;
    var currentDate = new Date();
    var currentTimestamp = currentDate.getTime() / 1000;

    const expiredBidsByBidder = await Bid.find(
      {
        $and: [
          { bidder: { $regex: new RegExp(`^${bidder}$`, "i") } },
          {
            $or: [
              { bidStatus: { $ne: ORDER_STATUS.active } },
              { expiresAt: { $lt: currentTimestamp } },
            ],
          },
        ],
      },
      { _id: 0, __v: 0, bidStatus: 0 }
    ).lean();
    return res.json({ ok: true, data: expiredBidsByBidder, error: "" });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
};
