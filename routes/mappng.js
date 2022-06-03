var express = require("express");
const MapPngController = require("../controllers/MapPngController");

var router = express.Router();

// @route    GET /api/v1/map
// @desc     Get all map data
// @access   Public
router.get("/", MapPngController.getMap);

module.exports = router;
