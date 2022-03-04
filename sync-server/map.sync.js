require("dotenv").config();

const { initMapWithTokenIds } = require("./preprocess/initdb");

// DB connection
var MONGODB_URL = process.env.MONGODB_URL;
var mongoose = require("mongoose");

mongoose
  .connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    //don't show the log when it is test
    if (process.env.NODE_ENV !== "test") {
      console.log("Connected to %s", MONGODB_URL);
      console.log("Map syncing is running ... \n");
      console.log("Press CTRL + C to stop the process. \n");
    }

    await initMapWithTokenIds();
  })
  .catch((err) => {
    console.error("Map sync server starting error: ", err.message);
    process.exit(1);
  });
