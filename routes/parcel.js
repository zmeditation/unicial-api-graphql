var express = require("express");
const ParcelController = require("../controllers/ParcelController");

var router = express.Router();

// @route    GET /api/v1/parcel/owner/:owner
// @desc     Get all parcels whose owner is :owner
// @access   Public
router.get("/owner/:owner", ParcelController.getParcelsByOwner);

module.exports = router;
