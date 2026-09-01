import { Router } from 'express';
import { evaluationsController } from '../controllers/evaluations.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRoles, allStaff } from '../middlewares/role.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { evaluerSchema } from '../validators/evaluation.validator';

const router = Router();

router.use(authMiddleware);

// Liste toutes les évaluations (staff)
router.get('/', allStaff, evaluationsController.lister);

// Évaluations d'une publication spécifique
router.get('/publication/:publicationId', allStaff, evaluationsController.parPublication);

// Évaluer une publication (équipe com uniquement)
router.post('/', requireRoles(
  'equipe_com', 'responsable_unicef', 'responsable_technique'
), validateBody(evaluerSchema), evaluationsController.evaluer);

export default router;
