import express from "express";
import * as bodyParser from "body-parser";
import mongoose, { ConnectOptions } from "mongoose";
import helmet from "helmet";
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/../.env" });

import { Routes } from "./routes/crmRoutes";

class App {
  public app: express.Application = express();
  public routePrv: Routes = new Routes();
  public mongoUrl: string =
    "mongodb://" +
    process.env.MONGODB_URL +
    ":" +
    process.env.MONGODB_PORT +
    "/" +
    process.env.MONGODB_DATABASE;

  constructor() {
    this.config();
    this.mongoSetup();
    this.routePrv.routes(this.app);
  }

  private config(): void {
    this.app.use(helmet());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    // serving static files
    this.app.use(express.static("public"));
  }

  private mongoSetup(): void {
    mongoose.Promise = global.Promise;
    mongoose
      .connect(this.mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as ConnectOptions)
      .then((res) => {
        console.log("Mongodb connected...");
      })
      .catch((err) => {
        console.log("Mongo error in connection:", err);
      });
  }
}

export default new App().app;
