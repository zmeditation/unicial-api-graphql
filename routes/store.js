var express = require("express");
const StoreController = require("../controllers/StoreController");

var router = express.Router();

router.get("/activeparcels", StoreController.getActiveParcels);
router.get("/activeestates", StoreController.getActiveEstates);
router.get("/successdata", StoreController.getSuccessData);

module.exports = router;
