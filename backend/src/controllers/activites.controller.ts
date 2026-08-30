import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { activitesService } from '../services/activites.service';
import { activitesRepository } from '../repositories/activites.repository';
import { sendSuccess, sendError } from '../utils/response';

export const activitesController = {

  async lister(req: AuthRequest, res: Response): Promise<void> {
    try {
      const role = req.user!.role;
      const filtres = role === 'jeune_blogueur'
        ? { userId: req.user!.id, role }
        : role === 'responsable_zone'
          ? { villeId: req.user!.ville_id ?? undefined, role }
          : { villeId: req.query.ville_id ? +req.query.ville_id : undefined, role };
      sendSuccess(res, await activitesService.lister(filtres));
    } catch (err: any) { sendError(res, err.message); }
  },

  async trouver(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await activitesService.trouver(+req.params.id));
    } catch (err: any) { sendError(res, err.message, 404); }
  },

  // Route PUBLIQUE (sans auth) — voir les infos de base via le lien de partage
  async trouverParToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      const activite = await activitesService.trouverParToken(req.params.token);
      // On ne renvoie que les infos utiles publiquement
      sendSuccess(res, {
        id:             activite.id,
        titre:          activite.titre,
        description:    activite.description,
        type:           activite.type,
        date_debut:     activite.date_debut,
        date_fin:       activite.date_fin,
        lieu:           activite.lieu,
        ville_nom:      activite.ville_nom,
        capacite_max:   activite.capacite_max,
        places_restantes: activite.capacite_max != null
          ? Math.max(0, activite.capacite_max - (activite.nb_participants ?? 0))
          : null,
      });
    } catch (err: any) { sendError(res, err.message, 404); }
  },

  // Route AUTHENTIFIÉE — confirmer sa participation via le lien
  async inscrireViaLien(req: AuthRequest, res: Response): Promise<void> {
    try {
      const activite = await activitesService.inscrireViaLien(req.params.token, req.user!.id);
      sendSuccess(res, activite, 'Inscription confirmée');
    } catch (err: any) { sendError(res, err.message); }
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