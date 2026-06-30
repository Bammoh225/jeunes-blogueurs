import { notificationsRepository } from '../repositories/notifications.repository';
import { CreateNotificationDto } from '../models/notification.model';

export const notificationsService = {

  async lister(destinataireId: number) {
    return notificationsRepository.findByDestinataire(destinataireId);
  },

  async creer(dto: CreateNotificationDto) {
    return notificationsRepository.create(dto);
  },

  async marquerLu(id: number, destinataireId: number) {
    const ok = await notificationsRepository.marquerLu(id, destinataireId);
    if (!ok) throw new Error('Notification introuvable');
  },

  async marquerTousLus(destinataireId: number) {
    await notificationsRepository.marquerTousLus(destinataireId);
  },

  async countNonLus(destinataireId: number) {
    return notificationsRepository.countNonLus(destinataireId);
  },

};
