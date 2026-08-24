import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: process.env.NODE_ENV === 'production' ? 5 : 30, // 30 tentatives en dev, 5 en prod
  message: { success: false, message: 'Trop de tentatives, réessayez plus tard.' }
});

router.post('/login',                      authController.login);
router.post('/mot-de-passe-oublie',        forgotPasswordLimiter, authController.motDePasseOublie);
router.post('/reinitialiser-mot-de-passe', authController.reinitialiserMotDePasse);
router.get('/profil',                      authMiddleware, authController.profil);
router.patch('/profil',                    authMiddleware, authController.modifierProfil);
router.patch('/mot-de-passe',              authMiddleware, authController.changerMotDePasse);

export default router;