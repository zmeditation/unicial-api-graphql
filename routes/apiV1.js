var express = require("express");
var mapRouter = require("./map");
var parcelRouter = require("./parcel");
var estateRouter = require("./estate");
var storeRouter = require("./store");

var app = express();

// @route    GET /api/v1/map
// @desc     Get map related data
// @access   Public
app.use("/map/", mapRouter);
app.use("/store/", storeRouter);

// @route    GET /api/v1/parcel
// @desc     Get parcel related data
// @access   Public
app.use("/parcel/", parcelRouter);

// @route    GET /api/v1/estate
// @desc     Get estate related data
// @access   Public
app.use("/estate/", estateRouter);

module.exports = app;
