import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { activitesService } from '../services/activites.service';
import { activitesRepository } from '../repositories/activites.repository';
import { sendSuccess, sendError } from '../utils/response';

export const activitesController = {

  async lister(req: AuthRequest, res: Response): Promise<void> {
    try {
      const villeId = req.user!.role === 'responsable_zone'
        ? req.user!.ville_id ?? undefined
        : req.query.ville_id ? +req.query.ville_id : undefined;
      sendSuccess(res, await activitesService.lister(villeId));
    } catch (err: any) { sendError(res, err.message); }
  },

  async trouver(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await activitesService.trouver(+req.params.id));
    } catch (err: any) { sendError(res, err.message, 404); }
  },

  async listerParticipants(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await activitesService.listerParticipants(+req.params.id));
    } catch (err: any) { sendError(res, err.message); }
  },

  async monStatut(req: AuthRequest, res: Response): Promise<void> {
    try {
      const statut = await activitesRepository.getMonStatut(+req.params.id, req.user!.id);
      sendSuccess(res, statut);
    } catch (err: any) { sendError(res, err.message); }
  },

  async creer(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await activitesService.creer(req.user!.id, req.body), 'Activité créée', 201);
    } catch (err: any) { sendError(res, err.message); }
  },

  async modifier(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await activitesService.modifier(+req.params.id, req.body));
    } catch (err: any) { sendError(res, err.message); }
  },

  async ajouterParticipant(req: AuthRequest, res: Response): Promise<void> {
    try {
      await activitesService.ajouterParticipant(+req.params.id, +req.body.utilisateur_id);
      sendSuccess(res, null, 'Participant ajouté');
    } catch (err: any) { sendError(res, err.message); }
  },

  async confirmerMaPresence(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Le blogueur confirme uniquement SA PROPRE présence
      await activitesService.marquerPresence(+req.params.id, req.user!.id, req.body.present);
      sendSuccess(res, null, 'Présence confirmée');
    } catch (err: any) { sendError(res, err.message); }
  },

  async marquerPresence(req: AuthRequest, res: Response): Promise<void> {
    try {
      await activitesService.marquerPresence(+req.params.id, +req.body.utilisateur_id, req.body.present);
      sendSuccess(res, null, 'Présence mise à jour');
    } catch (err: any) { sendError(res, err.message); }
  },

};
