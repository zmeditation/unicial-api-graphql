import { NextFunction, Request, Response } from 'express';
import * as fs from 'fs';
import path from 'path';

class MapController {
  public index = (req: Request, res: Response, next: NextFunction) => {
    try {
      let mapData = fs.readFileSync(path.join(__dirname, '../../../../api-samples/decentraland-v2-tiles.json'), { encoding: 'utf8', flag: 'r' });
      return res.status(200).json({ success: true, data: mapData, error: '' });
    } catch (error) {
      return res.status(200).json({ success: true, data: {}, error: 'Can not read map data' });
    }
  };
}

export default MapController;
