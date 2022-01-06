import { Router } from 'express';
import MapController from '@controllers/map.controller';
import { Routes } from '@interfaces/routes.interface';

class MapRouter implements Routes {
  public path = '/';
  public router = Router();
  public mapController = new MapController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // @route    GET api/v1/map
    // @desc     Get map data
    // @access   Public
    this.router.get(`${this.path}`, this.mapController.index);
  }
}

export default MapRouter;
