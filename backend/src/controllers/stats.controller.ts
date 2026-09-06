import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { statsRepository } from '../repositories/stats.repository';
import { sendSuccess, sendError } from '../utils/response';

export const statsController = {
  async getDashboardCharts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const publications = await statsRepository.getPublicationsParMois();
      const blogueurs = await statsRepository.getBlogueursParVille();
      
      sendSuccess(res, {
        publicationsParMois: publications,
        blogueursParVille: blogueurs
      });
    } catch (err: any) {
      sendError(res, err.message);
    }
  }
};
