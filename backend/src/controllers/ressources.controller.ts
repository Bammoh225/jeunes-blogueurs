import { Request, Response } from 'express';
import { ressourcesService } from '../services/ressources.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export const ressourcesController = {
  async lister(_req: Request, res: Response): Promise<void> {
    try {
      sendSuccess(res, await ressourcesService.lister());
    } catch (err: any) {
      sendError(res, err.message);
    }
  },

  async creer(req: AuthRequest, res: Response): Promise<void> {
    try {
      const dto = {
        ...req.body,
        createur_id: req.user?.id
      };
      const id = await ressourcesService.creer(dto);
      sendSuccess(res, { id }, 'Ressource ajoutée avec succès', 201);
    } catch (err: any) {
      sendError(res, err.message);
    }
  },

  async supprimer(req: Request, res: Response): Promise<void> {
    try {
      await ressourcesService.supprimer(+req.params.id);
      sendSuccess(res, null, 'Ressource supprimée avec succès');
    } catch (err: any) {
      sendError(res, err.message);
    }
  }
};
