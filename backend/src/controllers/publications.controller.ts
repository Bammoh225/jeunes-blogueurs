import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { publicationsService } from '../services/publications.service';
import { sendSuccess, sendError } from '../utils/response';

const isAdmin = (role: string) =>
  ['responsable_unicef','responsable_technique','responsable_national'].includes(role);

export const publicationsController = {

  async lister(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { auteur_id, categorie_id, thematique_id, page, limit, recherche, tri } = req.query;
      const filtAuteur = req.user!.role === 'jeune_blogueur'
        ? req.user!.id
        : auteur_id ? +auteur_id : undefined;

      const { data, total } = await publicationsService.lister(
        {
          auteur_id:     filtAuteur,
          categorie_id:  categorie_id  ? +categorie_id  : undefined,
          thematique_id: thematique_id ? +thematique_id : undefined,
        },
        {
          page:  page  ? +page  : undefined,
          limit: limit ? +limit : undefined,
        },
        typeof recherche === 'string' ? recherche : undefined,
        typeof tri === 'string' ? tri : undefined,
      );

      const limitUtilise = limit ? +limit : 20;
      const pageUtilisee  = page  ? +page  : 1;

      sendSuccess(res, data, 'Succès', 200, {
        total,
        page:       pageUtilisee,
        limit:      limitUtilise,
        totalPages: Math.max(1, Math.ceil(total / limitUtilise)),
      });
    } catch (err: any) { sendError(res, err.message); }
  },

  async trouver(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await publicationsService.trouver(+req.params.id));
    } catch (err: any) { sendError(res, err.message, 404); }
  },

  async soumettre(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await publicationsService.soumettre(req.user!, req.body), 'Publication soumise', 201);
    } catch (err: any) { sendError(res, err.message); }
  },

  async modifier(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await publicationsService.modifier(
        +req.params.id, req.user!.id, req.body, isAdmin(req.user!.role)
      ));
    } catch (err: any) { sendError(res, err.message); }
  },

  async supprimer(req: AuthRequest, res: Response): Promise<void> {
    try {
      await publicationsService.supprimer(+req.params.id, req.user!.id, isAdmin(req.user!.role));
      sendSuccess(res, null, 'Publication supprimée');
    } catch (err: any) { sendError(res, err.message); }
  },

};