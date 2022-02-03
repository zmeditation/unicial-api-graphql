var express = require("express");
const EstateController = require("../controllers/EstateController");

var router = express.Router();

// @route    GET /api/v1/parcel/owner/:owner
// @desc     Get all parcels whose owner is :owner
// @access   Public
router.get("/owner/:owner", EstateController.getEstatesByOwner);

module.exports = router;
