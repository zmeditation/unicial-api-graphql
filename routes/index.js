var express = require("express");
var router = express.Router();

// @route    GET /
// @desc     Get Home page
// @access   Public
router.get("/", function (req, res) {
  res.render("index", { title: "Express" });
});

module.exports = router;
