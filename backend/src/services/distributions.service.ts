import { distributionsRepository } from '../repositories/distributions.repository';
import { CreateDistributionDto, UpdateDistributionDto } from '../models/distribution.model';
import { notificationsService } from './notifications.service';

export const distributionsService = {

  async lister() {
    return distributionsRepository.findAll();
  },

  async trouver(id: number) {
    const d = await distributionsRepository.findById(id);
    if (!d) throw new Error('Distribution introuvable');
    return d;
  },

  async listerBeneficiaires(id: number) {
    return distributionsRepository.findBeneficiaires(id);
  },

  async creer(responsableId: number, dto: CreateDistributionDto) {
    if (!dto.beneficiaire_ids || dto.beneficiaire_ids.length === 0) {
      throw new Error('Sélectionnez au moins un bénéficiaire');
    }

    const id = await distributionsRepository.create(responsableId, dto);

    for (const userId of dto.beneficiaire_ids) {
      await notificationsService.creer({
        destinataire_id: userId,
        type:            'systeme',
        message:         `Vous avez été désigné(e) bénéficiaire : "${dto.libelle}"`,
        lien:            `/distributions/${id}`,
      });
    }

    return distributionsRepository.findById(id);
  },

  async modifier(id: number, dto: UpdateDistributionDto) {
    const ok = await distributionsRepository.update(id, dto);
    if (!ok) throw new Error('Distribution introuvable');
    return distributionsRepository.findById(id);
  },

  async marquerRecu(distributionId: number, userId: number, recu: boolean) {
    await distributionsRepository.marquerRecu(distributionId, userId, recu);
  },

  async supprimer(id: number) {
    const ok = await distributionsRepository.delete(id);
    if (!ok) throw new Error('Distribution introuvable');
  },

};
