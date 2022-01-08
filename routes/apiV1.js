var express = require("express");
var mapRouter = require("./map");

var app = express();

app.use("/map/", mapRouter);

module.exports = app;
