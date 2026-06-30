import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { authService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';

export const authController = {

  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, mot_de_passe } = req.body;
      const result = await authService.login(email, mot_de_passe);
      sendSuccess(res, result, 'Connexion réussie');
    } catch (err: any) {
      sendError(res, err.message, 401);
    }
  },

  async profil(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await authService.profil(req.user!.id);
      sendSuccess(res, data);
    } catch (err: any) {
      sendError(res, err.message, 404);
    }
  },

  async modifierProfil(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await authService.modifierProfil(req.user!.id, req.body);
      sendSuccess(res, data, 'Profil mis à jour');
    } catch (err: any) {
      sendError(res, err.message);
    }
  },

  async changerMotDePasse(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;
      await authService.changerMotDePasse(req.user!.id, ancien_mot_de_passe, nouveau_mot_de_passe);
      sendSuccess(res, null, 'Mot de passe modifié');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  },

};
