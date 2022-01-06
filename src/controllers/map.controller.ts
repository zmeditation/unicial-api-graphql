import { NextFunction, Request, Response } from 'express';

class MapController {
  public index = (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(401).json({ success: true, data: 'data', error: '' });
    } catch (error) {
      next(error);
    }
  };
}

export default MapController;
