import { activitesRepository } from '../repositories/activites.repository';
import { CreateActiviteDto, UpdateActiviteDto } from '../models/activite.model';
import { notificationsService } from './notifications.service';
import { blogueursRepository } from '../repositories/blogueurs.repository';

export const activitesService = {

  async lister(villeId?: number) {
    return activitesRepository.findAll(villeId);
  },

  async trouver(id: number) {
    const a = await activitesRepository.findById(id);
    if (!a) throw new Error('Activité introuvable');
    return a;
  },

  async listerParticipants(id: number) {
    return activitesRepository.findParticipants(id);
  },

  async creer(organisateurId: number, dto: CreateActiviteDto) {
    const id = await activitesRepository.create(organisateurId, dto);

    const blogueurs = await blogueursRepository.findAll({ ville_id: dto.ville_id, statut: 'actif' });
    for (const b of blogueurs) {
      await notificationsService.creer({
        destinataire_id: b.id,
        type:            'nouvelle_activite',
        message:         `Nouvelle activité dans votre ville : "${dto.titre}"`,
        lien:            `/activites/${id}`,
        activite_id:     id,
      });
    }

    return activitesRepository.findById(id);
  },

  async modifier(id: number, dto: UpdateActiviteDto) {
    const ok = await activitesRepository.update(id, dto);
    if (!ok) throw new Error('Activité introuvable');
    return activitesRepository.findById(id);
  },

  async ajouterParticipant(activiteId: number, userId: number) {
    await activitesRepository.addParticipant(activiteId, userId);
  },

  async marquerPresence(activiteId: number, userId: number, present: boolean) {
    await activitesRepository.marquerPresence(activiteId, userId, present);
  },

};
