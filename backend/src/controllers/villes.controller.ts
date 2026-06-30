import { Request, Response } from 'express';
import { villesService } from '../services/villes.service';
import { sendSuccess, sendError } from '../utils/response';

export const villesController = {

  async lister(_req: Request, res: Response): Promise<void> {
    try {
      sendSuccess(res, await villesService.lister());
    } catch (err: any) { sendError(res, err.message); }
  },

  async trouver(req: Request, res: Response): Promise<void> {
    try {
      sendSuccess(res, await villesService.trouver(+req.params.id));
    } catch (err: any) { sendError(res, err.message, 404); }
  },

};
