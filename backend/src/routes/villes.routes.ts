import { Router } from 'express';
import { villesController } from '../controllers/villes.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Liste des villes accessible à tous les connectés
router.get('/',    authMiddleware, villesController.lister);
router.get('/:id', authMiddleware, villesController.trouver);

export default router;
