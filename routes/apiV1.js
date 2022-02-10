var express = require("express");
var mapRouter = require("./map");
var storeRouter = require("./store");

var app = express();

app.use("/map/", mapRouter);
app.use("/store/", storeRouter);

module.exports = app;
