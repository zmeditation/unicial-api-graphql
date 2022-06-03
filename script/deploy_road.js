var fs = require("fs");
var mongoose = require("mongoose");
var Map = require("../models/MapModel");
var { ROAD_DISTRICT_ID, ROAD_ESTATE_ID } = require("../common/const");
require("dotenv").config("../.env");

var MONGODB_URL = process.env.MONGODB_URL;

exports.getDeployRoadData = async () => {
  try {
    await mongoose.connect(MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("success connection");
    await Map.aggregate(
      [
        {
          $project: {
            id: 1,
            x: 1,
            y: 1,
            district_id: {
              $cond: {
                if: { $eq: ["road", "$type"] },
                then: ROAD_DISTRICT_ID,
                else: null,
              },
            },
            estate_id: {
              $cond: {
                if: { $eq: ["road", "$type"] },
                then: ROAD_ESTATE_ID,
                else: null,
              },
            },
            _id: 0,
          },
        },
      ],
      function (err, result) {
        console.log("Total parcels: ", result.length, "Writing to file...");
        var JSONResult = JSON.stringify(result);
        fs.writeFileSync("./data/deploy_road_data.json", JSONResult);
        console.log("Write finished. Exit.");
        process.exit();
      }
    );
  } catch (error) {
    console.log("Error connection: " + error);
    process.exit(1);
  }
};
this.getDeployRoadData();
