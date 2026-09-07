import { Router } from 'express';
import { statsController } from '../controllers/stats.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { allStaff } from '../middlewares/role.middleware';

const router = Router();

router.use(authMiddleware, allStaff);

router.get('/charts', statsController.getDashboardCharts);

export default router;
