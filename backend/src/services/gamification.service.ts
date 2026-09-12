import { gamificationRepository } from '../repositories/gamification.repository';
import { blogueursRepository } from '../repositories/blogueurs.repository';
import { notificationsService } from './notifications.service';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

export const gamificationService = {
  async checkAndAssignBadges(blogueurId: number): Promise<void> {
    const blogueur = await blogueursRepository.findById(blogueurId);
    if (!blogueur) return;

    const allBadges = await gamificationRepository.getAllBadges();
    const userBadges = await gamificationRepository.getBadgesForBlogueur(blogueurId);
    const userBadgeIds = new Set(userBadges.map(b => b.id));

    // Get number of activities participated in
    const [actRows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM participants_activites WHERE utilisateur_id = ? AND present = 1',
      [blogueurId]
    );
    const nbActivites = actRows[0]?.count || 0;

    for (const badge of allBadges) {
      if (userBadgeIds.has(badge.id)) continue;

      let isEligible = false;

      if (badge.critere_type === 'publications') {
        if ((blogueur.nb_publications ?? 0) >= badge.critere_valeur) {
          isEligible = true;
        }
      } else if (badge.critere_type === 'activites') {
        if (nbActivites >= badge.critere_valeur) {
          isEligible = true;
        }
      } else if (badge.critere_type === 'anciennete') {
        const createdDate = new Date(blogueur.created_at || new Date());
        const monthsDiff = (new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        if (monthsDiff >= badge.critere_valeur) {
          isEligible = true;
        }
      }

      if (isEligible) {
        const assigned = await gamificationRepository.assignBadge(blogueurId, badge.id);
        if (assigned) {
          await notificationsService.creer({
            destinataire_id: blogueurId,
            message: `Félicitations ! Vous avez obtenu le badge "${badge.nom}".`,
            type: 'systeme',
            lien: '/profil'
          });
        }
      }
    }
  },

  async getBadgesForBlogueur(blogueurId: number) {
    return gamificationRepository.getBadgesForBlogueur(blogueurId);
  }
};
