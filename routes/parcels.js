var express = require("express");
const ParcelMapPngController = require("../controllers/ParcelController");

var router = express.Router();

// @route    GET /api/v1/map
// @desc     Get all map data
// @access   Public
router.get("/:x/:y/map.png", ParcelMapPngController.getMap);

module.exports = router;
