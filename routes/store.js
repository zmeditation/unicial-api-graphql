var express = require("express");
const StoreController = require("../controllers/StoreController");

var router = express.Router();

router.get("/activeparcels", StoreController.getActiveParcels);
router.get("/activebids", StoreController.getActiveBids);

module.exports = router;
