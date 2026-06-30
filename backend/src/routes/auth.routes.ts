import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login',            authController.login);
router.get('/profil',            authMiddleware, authController.profil);
router.patch('/profil',          authMiddleware, authController.modifierProfil);
router.patch('/mot-de-passe',    authMiddleware, authController.changerMotDePasse);

export default router;
