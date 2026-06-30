import { Router } from 'express';
import { publicationsController } from '../controllers/publications.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRoles, allStaff } from '../middlewares/role.middleware';

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
router.post('/',      requireRoles('jeune_blogueur'),                    publicationsController.soumettre);
router.patch('/:id',  requireRoles(
  'jeune_blogueur','responsable_unicef','responsable_technique'
),                                                                       publicationsController.modifier);
router.delete('/:id', requireRoles(
  'jeune_blogueur','responsable_unicef','responsable_technique'
),                                                                       publicationsController.supprimer);

export default router;
