import { Request, Response } from 'express';
import { utilisateursService } from '../services/utilisateurs.service';
import { sendSuccess, sendError } from '../utils/response';

export const utilisateursController = {

  async lister(_req: Request, res: Response): Promise<void> {
    try {
      sendSuccess(res, await utilisateursService.lister());
    } catch (err: any) { sendError(res, err.message); }
  },

  async trouver(req: Request, res: Response): Promise<void> {
    try {
      sendSuccess(res, await utilisateursService.trouver(+req.params.id));
    } catch (err: any) { sendError(res, err.message, 404); }
  },

  async creer(req: Request, res: Response): Promise<void> {
    try {
      sendSuccess(res, await utilisateursService.creer(req.body), 'Utilisateur créé', 201);
    } catch (err: any) { sendError(res, err.message); }
  },

  async modifier(req: Request, res: Response): Promise<void> {
    try {
      sendSuccess(res, await utilisateursService.modifier(+req.params.id, req.body));
    } catch (err: any) { sendError(res, err.message); }
  },

  async desactiver(req: Request, res: Response): Promise<void> {
    try {
      await utilisateursService.desactiver(+req.params.id);
      sendSuccess(res, null, 'Utilisateur désactivé');
    } catch (err: any) { sendError(res, err.message, 404); }
  },

};
