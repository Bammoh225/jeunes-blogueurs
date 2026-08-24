import { Router } from 'express';
import { villesController } from '../controllers/villes.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Liste des villes — publique (nécessaire pour le formulaire d'inscription, avant authentification)
router.get('/',    villesController.lister);
router.get('/:id', villesController.trouver);

export default router;