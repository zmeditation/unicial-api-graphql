var express = require("express");
const BidController = require("../controllers/BidController");

var router = express.Router();

router.get("/active", BidController.getActiveBids);
router.get("/all", BidController.getAllBids);
router.get("/bidder/:bidder", BidController.getBidsByBidder);
router.get("/bidder/:bidder/active", BidController.getActiveBidsByBidder);
router.get("/bidder/:bidder/expired", BidController.getExpiredBidsByBidder);

module.exports = router;
