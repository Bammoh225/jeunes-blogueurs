import { publicationsRepository } from '../repositories/publications.repository';
import { CreatePublicationDto, UpdatePublicationDto } from '../models/publication.model';
import { blogueursRepository } from '../repositories/blogueurs.repository';
import { utilisateursRepository } from '../repositories/utilisateurs.repository';
import { notificationsService } from './notifications.service';
import { JwtPayload } from '../types';

export const publicationsService = {

  async lister(filtres?: { auteur_id?: number; categorie_id?: number; thematique_id?: number }) {
    return publicationsRepository.findAll(filtres);
  },

  async trouver(id: number) {
    const p = await publicationsRepository.findById(id);
    if (!p) throw new Error('Publication introuvable');
    return p;
  },

  async soumettre(auteur: JwtPayload, dto: CreatePublicationDto) {
    const id = await publicationsRepository.create(auteur.id, dto);

    // Incrémenter le compteur du blogueur
    await blogueursRepository.incrementPublications(auteur.id);

    // Notifier le responsable de la catégorie et l'équipe com
    const staff = await utilisateursRepository.findAll();
    const aNotifier = staff.filter(u =>
      u.role === 'equipe_com' ||
      (u.role === 'responsable_categorie' && (u as any).categorie_id === dto.categorie_id)
    );

    for (const u of aNotifier) {
      await notificationsService.creer({
        destinataire_id: u.id,
        type:            'nouvelle_publication',
        message:         `Nouvelle publication soumise par ${auteur.prenom ?? ''} : "${dto.titre}"`,
        lien:            `/publications/${id}`,
        publication_id:  id,
      });
    }

    return publicationsRepository.findById(id);
  },

  async modifier(id: number, auteurId: number, dto: UpdatePublicationDto, isAdmin: boolean) {
    const pub = await publicationsRepository.findById(id);
    if (!pub) throw new Error('Publication introuvable');

    // Un jeune ne peut modifier que ses propres publications
    if (!isAdmin && pub.auteur_id !== auteurId) throw new Error('Accès refusé');

    await publicationsRepository.update(id, dto);
    return publicationsRepository.findById(id);
  },

  async supprimer(id: number, auteurId: number, isAdmin: boolean) {
    const pub = await publicationsRepository.findById(id);
    if (!pub) throw new Error('Publication introuvable');
    if (!isAdmin && pub.auteur_id !== auteurId) throw new Error('Accès refusé');

    const ok = await publicationsRepository.delete(id);
    if (!ok) throw new Error('Suppression échouée');
  },

};
