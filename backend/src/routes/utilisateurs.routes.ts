import { Router } from 'express';
import { utilisateursController } from '../controllers/utilisateurs.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminOnly } from '../middlewares/role.middleware';

const router = Router();

// Toutes les routes nécessitent d'être admin ou responsable_technique
router.use(authMiddleware, adminOnly);

router.get('/',       utilisateursController.lister);
router.get('/:id',    utilisateursController.trouver);
router.post('/',      utilisateursController.creer);
router.patch('/:id',  utilisateursController.modifier);
router.delete('/:id', utilisateursController.desactiver);

export default router;
