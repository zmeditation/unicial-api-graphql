var express = require("express");
const MapController = require("../controllers/MapController");

var router = express.Router();

router.get("/", MapController.getMap);
router.get("/addowners", MapController.addOwners);

module.exports = router;
