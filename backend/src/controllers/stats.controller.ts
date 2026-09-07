import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { statsRepository } from '../repositories/stats.repository';
import { sendSuccess, sendError } from '../utils/response';

export const statsController = {

  async getDashboardCharts(
    _req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const [publications, blogueurs] = await Promise.all([
        statsRepository.getPublicationsParMois(),
        statsRepository.getBlogueursParVille()
      ]);

      sendSuccess(res, {
        publicationsParMois: publications,
        blogueursParVille: blogueurs
      });
    } catch (err) {
      console.error('[STATS] Erreur récupération statistiques:', err);

      sendError(
        res,
        'Impossible de récupérer les statistiques'
      );
    }
  }

};
