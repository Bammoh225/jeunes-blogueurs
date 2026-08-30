import { Router } from 'express';
import { activitesController } from '../controllers/activites.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/role.middleware';

const router = Router();

// Route publique — infos de base via le lien de partage (AVANT authMiddleware)
router.get('/public/:token', activitesController.trouverParToken);

router.use(authMiddleware);

const tousLesRoles = requireRoles(
  'responsable_unicef', 'responsable_technique', 'responsable_national',
  'responsable_zone', 'responsable_categorie', 'equipe_com', 'jeune_blogueur'
);
const staffSeulement = requireRoles(
  'responsable_unicef', 'responsable_technique', 'responsable_national',
  'responsable_zone', 'responsable_categorie', 'equipe_com'
);

router.get('/',                           tousLesRoles,   activitesController.lister);
router.get('/:id',                        tousLesRoles,   activitesController.trouver);
router.get('/:id/mon-statut',             tousLesRoles,   activitesController.monStatut);
router.get('/:id/participants',           staffSeulement, activitesController.listerParticipants);
router.post('/', requireRoles(
  'responsable_unicef','responsable_technique','responsable_national','responsable_zone'
), activitesController.creer);
router.patch('/:id', requireRoles(
  'responsable_unicef','responsable_technique','responsable_national','responsable_zone'
), activitesController.modifier);
router.post('/:id/participants',              tousLesRoles,   activitesController.ajouterParticipant);
router.post('/rejoindre/:token',              tousLesRoles,   activitesController.inscrireViaLien);
router.patch('/:id/ma-presence',              tousLesRoles,   activitesController.confirmerMaPresence);
router.patch('/:id/participants/presence',    staffSeulement, activitesController.marquerPresence);

export default router;