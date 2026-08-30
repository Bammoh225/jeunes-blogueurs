import { activitesRepository } from '../repositories/activites.repository';
import { CreateActiviteDto, UpdateActiviteDto } from '../models/activite.model';
import { notificationsService } from './notifications.service';
import { blogueursRepository } from '../repositories/blogueurs.repository';

export const activitesService = {

  async lister(filtres?: { villeId?: number; userId?: number; role?: string }) {
    return activitesRepository.findAll(filtres);
  },

  async trouver(id: number) {
    const a = await activitesRepository.findById(id);
    if (!a) throw new Error('Activité introuvable');
    return a;
  },

  async trouverParToken(token: string) {
    const a = await activitesRepository.findByToken(token);
    if (!a) throw new Error('Lien invalide ou activité introuvable');
    return a;
  },

  async listerParticipants(id: number) {
    return activitesRepository.findParticipants(id);
  },

  async creer(organisateurId: number, dto: CreateActiviteDto) {
    if (dto.visibilite === 'designee' && (!dto.participant_ids || dto.participant_ids.length === 0)) {
      throw new Error('Veuillez désigner au moins un blogueur pour une activité à visibilité restreinte');
    }

    const id = await activitesRepository.create(organisateurId, dto);

    // Notifier soit les blogueurs désignés, soit toute la ville
    const destinataires = dto.visibilite === 'designee'
      ? dto.participant_ids!
      : (await blogueursRepository.findAll({ ville_id: dto.ville_id, statut: 'actif' })).map(b => b.id);

    for (const destId of destinataires) {
      await notificationsService.creer({
        destinataire_id: destId,
        type:            'nouvelle_activite',
        message:         `Nouvelle activité : "${dto.titre}"`,
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
    await this.verifierCapacite(activiteId);
    await activitesRepository.addParticipant(activiteId, userId);
  },

  async inscrireViaLien(token: string, userId: number) {
    const activite = await activitesRepository.findByToken(token);
    if (!activite) throw new Error('Lien invalide ou activité introuvable');
    await this.verifierCapacite(activite.id);
    await activitesRepository.addParticipant(activite.id, userId);
    return activitesRepository.findById(activite.id);
  },

  async verifierCapacite(activiteId: number) {
    const activite = await activitesRepository.findById(activiteId);
    if (!activite) throw new Error('Activité introuvable');
    if (activite.capacite_max != null) {
      const nb = await activitesRepository.countParticipants(activiteId);
      if (nb >= activite.capacite_max) {
        throw new Error('Cette activité est complète, il n\'y a plus de places disponibles');
      }
    }
  },

  async marquerPresence(activiteId: number, userId: number, present: boolean) {
    await activitesRepository.marquerPresence(activiteId, userId, present);
  },

};