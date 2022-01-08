import { Router } from 'express';
import IndexController from '@controllers/index.controller';
import { Routes } from '@interfaces/routes.interface';

// import sub-routers
import MapRouter from './map.route';

class V1IndexRoute implements Routes {
  public path = '/';
  public router = Router();
  public indexController = new IndexController();
  public mapRouter = new MapRouter();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // @route    GET api/v1
    // @desc     Get 200 status
    // @access   Public
    this.router.get(`${this.path}`, this.indexController.index);

    // @route    GET api/v1/map
    // @desc     Use api/v1/map sub-routers
    // @access   Public
    this.router.use(`${this.path}map/`, this.mapRouter.router);
  }
}

export default V1IndexRoute;
