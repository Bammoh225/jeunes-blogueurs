import { Router } from 'express';
import { publicationsController } from '../controllers/publications.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRoles, allStaff } from '../middlewares/role.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import {
  creerPublicationSchema,
  modifierPublicationSchema,
} from '../validators/publication.validator';

const router = Router();

router.use(authMiddleware);

router.get('/',       requireRoles(
  'responsable_unicef', 'responsable_technique', 'responsable_national',
  'responsable_zone', 'responsable_categorie', 'equipe_com', 'jeune_blogueur'
),                                                                       publicationsController.lister);
router.get('/:id',    requireRoles(
  'responsable_unicef', 'responsable_technique', 'responsable_national',
  'responsable_zone', 'responsable_categorie', 'equipe_com', 'jeune_blogueur'
),                                                                       publicationsController.trouver);
router.post('/',      requireRoles(
  'responsable_technique', 'responsable_national', 'responsable_zone',
  'responsable_categorie', 'equipe_com', 'jeune_blogueur'
), validateBody(creerPublicationSchema),                                 publicationsController.soumettre);
router.patch('/:id',  requireRoles(
  'responsable_unicef','responsable_technique','responsable_national',
  'responsable_zone', 'responsable_categorie', 'equipe_com', 'jeune_blogueur'
), validateBody(modifierPublicationSchema),                              publicationsController.modifier);
router.delete('/:id', requireRoles(
  'responsable_unicef','responsable_technique','responsable_national',
  'responsable_zone', 'responsable_categorie', 'equipe_com', 'jeune_blogueur'
),                                                                       publicationsController.supprimer);

export default router;
