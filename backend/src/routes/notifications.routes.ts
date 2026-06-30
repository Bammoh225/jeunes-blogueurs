import { Router } from 'express';
import { notificationsController } from '../controllers/notifications.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Chaque utilisateur ne voit que ses propres notifications
router.get('/',              notificationsController.lister);
router.get('/non-lus',       notificationsController.nonLus);
router.patch('/:id/lu',      notificationsController.marquerLu);
router.patch('/tous-lus',    notificationsController.marquerTousLus);

export default router;
