var express = require("express");
const MapController = require("../controllers/MapController");

var router = express.Router();

router.get("/", MapController.getMap);

module.exports = router;
