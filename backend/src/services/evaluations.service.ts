import { evaluationsRepository } from '../repositories/evaluations.repository';
import { CreateEvaluationDto } from '../models/evaluation.model';
import { publicationsRepository } from '../repositories/publications.repository';
import { notificationsService } from './notifications.service';

export const evaluationsService = {

  async listerParPublication(publicationId: number) {
    const pub = await publicationsRepository.findById(publicationId);
    if (!pub) throw new Error('Publication introuvable');
    return evaluationsRepository.findByPublication(publicationId);
  },

  async lister() {
    return evaluationsRepository.findAll();
  },

  async evaluer(evaluateurId: number, dto: CreateEvaluationDto) {
    const pub = await publicationsRepository.findById(dto.publication_id);
    if (!pub) throw new Error('Publication introuvable');

    const id = await evaluationsRepository.create(evaluateurId, dto);

    // Notifier l'auteur de la publication
    await notificationsService.creer({
      destinataire_id: pub.auteur_id,
      type:            'publication_evaluee',
      message:         `Votre publication "${pub.titre}" a été évaluée.`,
      lien:            `/publications/${pub.id}`,
      publication_id:  pub.id,
    });

    return evaluationsRepository.findByPublication(dto.publication_id);
  },

};
