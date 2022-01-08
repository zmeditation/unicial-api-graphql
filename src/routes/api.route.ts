import { Router } from 'express';
import IndexController from '@controllers/index.controller';
import { Routes } from '@interfaces/routes.interface';

// import sub-routers
import V1IndexRouter from './v1/index.route';

class ApiRoute implements Routes {
  public path = '/api';
  public router = Router();
  public indexController = new IndexController();
  public v1Router = new V1IndexRouter();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // @route    GET api/
    // @desc     Get 200 status
    // @access   Public
    this.router.get(`${this.path}`, this.indexController.index);

    // @route    GET api/v1/*
    // @desc     Use api/v1 sub-routers
    // @access   Public
    this.router.use(`${this.path}/v1`, this.v1Router.router);
  }
}

export default ApiRoute;
