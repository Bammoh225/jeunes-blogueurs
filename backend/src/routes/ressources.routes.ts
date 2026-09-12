import { Router } from 'express';
import { ressourcesController } from '../controllers/ressources.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { allStaff } from '../middlewares/role.middleware';

const router = Router();

router.get('/', authMiddleware, ressourcesController.lister);
router.post('/', authMiddleware, allStaff, ressourcesController.creer);
router.delete('/:id', authMiddleware, allStaff, ressourcesController.supprimer);

export default router;
