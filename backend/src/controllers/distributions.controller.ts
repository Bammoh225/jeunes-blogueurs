import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { distributionsService } from '../services/distributions.service';
import { sendSuccess, sendError } from '../utils/response';

const isStaff = (role: string) =>
  ['responsable_unicef','responsable_technique','responsable_national','responsable_zone',
   'responsable_categorie','equipe_com'].includes(role);

export const distributionsController = {

  async lister(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await distributionsService.lister(req.user!.id, req.user!.role));
    } catch (err: any) { sendError(res, err.message); }
  },

  async trouver(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await distributionsService.trouver(+req.params.id, req.user!.id, req.user!.role));
    } catch (err: any) { sendError(res, err.message, 404); }
  },

  async listerBeneficiaires(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await distributionsService.listerBeneficiaires(
        +req.params.id,
        req.user!.id,
        req.user!.role
      ));
    } catch (err: any) { sendError(res, err.message); }
  },

  async creer(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await distributionsService.creer(req.user!.id, req.body), 'Distribution créée', 201);
    } catch (err: any) { sendError(res, err.message); }
  },

  async modifier(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await distributionsService.modifier(+req.params.id, req.body));
    } catch (err: any) { sendError(res, err.message); }
  },

  async marquerRecu(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cibleId = +req.body.utilisateur_id;

      // Un blogueur ne peut confirmer que sa propre réception
      if (!isStaff(req.user!.role) && cibleId !== req.user!.id) {
        sendError(res, 'Vous ne pouvez confirmer que votre propre réception', 403);
        return;
      }

      await distributionsService.marquerRecu(
        +req.params.id,
        cibleId,
        req.body.recu,
        req.user!.role
      );
      sendSuccess(res, null, 'Statut mis à jour');
    } catch (err: any) { sendError(res, err.message); }
  },

  async supprimer(req: AuthRequest, res: Response): Promise<void> {
    try {
      await distributionsService.supprimer(+req.params.id);
      sendSuccess(res, null, 'Distribution supprimée');
    } catch (err: any) { sendError(res, err.message); }
  },

};
