import { Router } from 'express';
import { distributionsController } from '../controllers/distributions.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/role.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import {
  creerDistributionSchema,
  modifierDistributionSchema,
  marquerRecuSchema,
} from '../validators/distribution.validator';

const router = Router();

router.use(authMiddleware);

const tousLesRoles = requireRoles(
  'responsable_unicef', 'responsable_technique', 'responsable_national',
  'responsable_zone', 'responsable_categorie', 'equipe_com', 'jeune_blogueur'
);

const gestionnaires = requireRoles(
  'responsable_unicef', 'responsable_technique',
  'responsable_national', 'responsable_zone'
);

router.get('/',                  tousLesRoles, distributionsController.lister);
router.get('/:id',               tousLesRoles, distributionsController.trouver);
router.get('/:id/beneficiaires', tousLesRoles, distributionsController.listerBeneficiaires);

router.post('/',      gestionnaires, validateBody(creerDistributionSchema),   distributionsController.creer);
router.patch('/:id',  gestionnaires, validateBody(modifierDistributionSchema), distributionsController.modifier);
router.delete('/:id', gestionnaires, distributionsController.supprimer);

// Le staff peut marquer n'importe qui ; un blogueur ne peut confirmer que lui-même (vérifié dans le controller)
router.patch('/:id/beneficiaires/recu', tousLesRoles,
  validateBody(marquerRecuSchema), distributionsController.marquerRecu);

export default router;
