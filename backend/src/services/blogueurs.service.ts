import { blogueursRepository } from '../repositories/blogueurs.repository';
import { CreateBlogueurDto, UpdateBlogueurDto } from '../models/blogueur.model';
import { StatutBlogueur } from '../types';
import { hashPassword } from '../utils/bcrypt';
import { notificationsService } from './notifications.service';
import { utilisateursRepository } from '../repositories/utilisateurs.repository';

export const blogueursService = {

  async lister(filtres?: { statut?: StatutBlogueur; ville_id?: number; categorie_id?: number }) {
    return blogueursRepository.findAll(filtres);
  },

  async trouver(id: number) {
    const b = await blogueursRepository.findById(id);
    if (!b) throw new Error('Blogueur introuvable');
    return b;
  },

  async inscrire(dto: CreateBlogueurDto) {
    const existe = await blogueursRepository.emailExists(dto.email);
    if (existe) throw new Error('Cet email est déjà utilisé');

    if (dto.thematique_ids.length === 0) throw new Error('Choisissez au moins une thématique');
    if (dto.thematique_ids.length > 3)   throw new Error('Maximum 3 thématiques');

    const hash = await hashPassword(dto.mot_de_passe);
    const id   = await blogueursRepository.create(dto, hash);

    // Notifier le responsable national et le responsable de catégorie
    const staff = await utilisateursRepository.findAll();
    const aNotifier = staff.filter(u =>
      u.role === 'responsable_national' ||
      (u.role === 'responsable_categorie' && (u as any).categorie_id === dto.categorie_id)
    );

    for (const u of aNotifier) {
      await notificationsService.creer({
        destinataire_id: u.id,
        type:            'nouvelle_inscription',
        message:         `Nouvelle inscription : ${dto.prenom} ${dto.nom} (${dto.email})`,
        lien:            `/blogueurs/${id}`,
      });
    }

    return blogueursRepository.findById(id);
  },

  async modifier(id: number, dto: UpdateBlogueurDto) {
    const existe = await blogueursRepository.findById(id);
    if (!existe) throw new Error('Blogueur introuvable');
    await blogueursRepository.update(id, dto);
    return blogueursRepository.findById(id);
  },

  async changerStatut(id: number, statut: StatutBlogueur) {
    const ok = await blogueursRepository.updateStatut(id, statut);
    if (!ok) throw new Error('Blogueur introuvable');

    const messages: Record<StatutBlogueur, string> = {
      actif:      'Votre compte a été activé. Vous pouvez maintenant vous connecter.',
      en_attente: 'Votre compte est en attente de validation par un responsable.',
      inactif:    'Votre compte a été désactivé. Contactez un responsable pour plus d\'informations.',
      suspendu:   'Votre compte a été suspendu. Contactez un responsable pour plus d\'informations.',
    };

    await notificationsService.creer({
      destinataire_id: id,
      type:            'systeme',
      message:         messages[statut],
      lien:            '/profil',
    });

    return blogueursRepository.findById(id);
  },

};
