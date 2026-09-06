import { Router } from 'express';
import { statsController } from '../controllers/stats.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/role.middleware';

const router = Router();

// Seuls les staffs voient les stats
router.use(authMiddleware, requireRoles(
  'responsable_unicef', 'responsable_technique', 'responsable_national',
  'responsable_zone', 'responsable_categorie', 'equipe_com'
));

router.get('/charts', statsController.getDashboardCharts);

export default router;
