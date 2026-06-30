import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { notificationsService } from '../services/notifications.service';
import { sendSuccess, sendError } from '../utils/response';

export const notificationsController = {

  async lister(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, await notificationsService.lister(req.user!.id));
    } catch (err: any) { sendError(res, err.message); }
  },

  async nonLus(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccess(res, { total: await notificationsService.countNonLus(req.user!.id) });
    } catch (err: any) { sendError(res, err.message); }
  },

  async marquerLu(req: AuthRequest, res: Response): Promise<void> {
    try {
      await notificationsService.marquerLu(+req.params.id, req.user!.id);
      sendSuccess(res, null, 'Notification marquée lue');
    } catch (err: any) { sendError(res, err.message, 404); }
  },

  async marquerTousLus(req: AuthRequest, res: Response): Promise<void> {
    try {
      await notificationsService.marquerTousLus(req.user!.id);
      sendSuccess(res, null, 'Toutes les notifications marquées lues');
    } catch (err: any) { sendError(res, err.message); }
  },

};