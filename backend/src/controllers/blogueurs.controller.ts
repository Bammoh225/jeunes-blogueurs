import { Request, Response } from 'express';
import { blogueursService } from '../services/blogueurs.service';
import { sendSuccess, sendError } from '../utils/response';

export const blogueursController = {

  async lister(req: Request, res: Response): Promise<void> {
    try {
      const { statut, ville_id, categorie_id } = req.query;
      const filtres = {
        statut:       statut as any,
        ville_id:     ville_id     ? +ville_id     : undefined,
        categorie_id: categorie_id ? +categorie_id : undefined,
      };
      sendSuccess(res, await blogueursService.lister(filtres));
    } catch (err: any) { sendError(res, err.message); }
  },

  async trouver(req: Request, res: Response): Promise<void> {
    try {
      sendSuccess(res, await blogueursService.trouver(+req.params.id));
    } catch (err: any) { sendError(res, err.message, 404); }
  },

  async inscrire(req: Request, res: Response): Promise<void> {
    try {
      sendSuccess(res, await blogueursService.inscrire(req.body), 'Inscription réussie', 201);
    } catch (err: any) { sendError(res, err.message); }
  },

  async modifier(req: Request, res: Response): Promise<void> {
    try {
      sendSuccess(res, await blogueursService.modifier(+req.params.id, req.body));
    } catch (err: any) { sendError(res, err.message); }
  },

  async changerStatut(req: Request, res: Response): Promise<void> {
    try {
      sendSuccess(res, await blogueursService.changerStatut(+req.params.id, req.body.statut));
    } catch (err: any) { sendError(res, err.message); }
  },

};
