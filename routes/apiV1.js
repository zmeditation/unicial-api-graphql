var express = require("express");
var mapRouter = require("./map");
var mapPngRouter = require("./mappng");
var parcelRouter = require("./parcel");
var estateRouter = require("./estate");
var storeRouter = require("./store");
var bidRouter = require("./bid");
var graphqlRouter = require("./graphql");

var app = express();

// @route    GET /api/v1/map
// @desc     Get map related data
// @access   Public
app.use("/map/", mapRouter);

// @route    GET /api/v1/map
// @desc     Get map related data
// @access   Public
app.use("/map.png/", mapPngRouter);

// @route    GET /api/v1/map.png
// @desc     Get map related data
// @access   Public
app.use("/store/", storeRouter);

// @route    GET /api/v1/parcel
// @desc     Get parcel related data
// @access   Public
app.use("/parcel/", parcelRouter);

// @route    GET /api/v1/estate
// @desc     Get estate related data
// @access   Public
app.use("/estate/", estateRouter);

// @route    GET /api/v1/bid
// @desc     Get bid related data
// @access   Public
app.use("/bid/", bidRouter);
// @route    GET /api/v1/graphql
// @desc     Get graphql related data
// @access   Public
app.use("/graphql/", graphqlRouter);

module.exports = app;
