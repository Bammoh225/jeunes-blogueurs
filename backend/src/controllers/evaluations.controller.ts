import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { evaluationsService } from '../services/evaluations.service';
import { sendSuccess, sendError } from '../utils/response';

export const evaluationsController = {

  async lister(_req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await evaluationsService.lister());
    } catch (err: any) { sendError(res, err.message); }
  },

  async parPublication(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await evaluationsService.listerParPublication(+req.params.publicationId));
    } catch (err: any) { sendError(res, err.message, 404); }
  },

  async evaluer(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await evaluationsService.evaluer(req.user!.id, req.body), 'Évaluation enregistrée', 201);
    } catch (err: any) { sendError(res, err.message); }
  },

};