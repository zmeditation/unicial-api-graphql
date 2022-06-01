var Map = require("../models/MapModel");
var fs = require("fs");
var mongoose = require("mongoose");
exports.getDeployRoadData = async () => {
  try {
    var db = await mongoose.connect("mongodb://localhost:27017", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "unicial_db",
    });
    console.log("success connection");
    await Map.aggregate(
      [
        {
          $project: {
            id: 1,
            x: 1,
            y: 1,
            author: {
              $cond: {
                if: { $eq: ["road", "$type"] },
                then: "52edce54-568b-48be-b0e8-778c5a57ece9",
                else: null,
              },
            },
            estate_id: {
              $cond: {
                if: { $eq: ["road", "$type"] },
                then: "1186",
                else: null,
              },
            },
            _id: 0,
          },
        },
      ],
      function (err, result) {
        console.log(result.length);
        var JSONResult = JSON.stringify(result);
        fs.writeFileSync("./data/deploy_road_data.json", JSONResult);
      }
    );
  } catch (error) {
    console.log("Error connection: " + error);
  }
};
this.getDeployRoadData();
