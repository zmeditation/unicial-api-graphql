var express = require("express");
const MapController = require("../controllers/MapController");

var router = express.Router();

// @route    GET /api/v1/map
// @desc     Get all map data
// @access   Public
router.get("/", MapController.getMap);

module.exports = router;
