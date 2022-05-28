var express = require("express");
const GraphqlController = require("../controllers/GraphqlController");

var router = express.Router();

router.get("/land", GraphqlController.getLands);

module.exports = router;
