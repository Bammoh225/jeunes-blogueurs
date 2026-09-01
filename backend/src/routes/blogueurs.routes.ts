import { Router } from 'express';
import { blogueursController } from '../controllers/blogueurs.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { allStaff, managementRoles, requireRoles } from '../middlewares/role.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import {
  inscrireBlogueurSchema,
  modifierBlogueurSchema,
  changerStatutSchema,
} from '../validators/blogueur.validator';

const router = Router();

// Inscription publique (un jeune peut s'inscrire sans être connecté)
router.post('/', validateBody(inscrireBlogueurSchema), blogueursController.inscrire);

// Routes protégées
router.get('/',          authMiddleware, allStaff,         blogueursController.lister);
router.get('/:id',       authMiddleware, allStaff,         blogueursController.trouver);
router.patch('/:id',     authMiddleware, requireRoles(
  'responsable_unicef', 'responsable_technique',
  'responsable_national', 'responsable_zone', 'jeune_blogueur'
), validateBody(modifierBlogueurSchema),                   blogueursController.modifier);
router.patch('/:id/statut', authMiddleware, managementRoles,
  validateBody(changerStatutSchema),                       blogueursController.changerStatut);

export default router;
