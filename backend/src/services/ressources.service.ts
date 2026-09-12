import { ressourcesRepository } from '../repositories/ressources.repository';
import { CreateRessourceDto } from '../models/ressource.model';

export const ressourcesService = {
  async lister() {
    return ressourcesRepository.findAll();
  },

  async creer(dto: CreateRessourceDto) {
    if (!dto.titre || !dto.url || !dto.type) {
      throw new Error('Les champs titre, url et type sont obligatoires');
    }
    const id = await ressourcesRepository.create(dto);
    return id;
  },

  async supprimer(id: number) {
    const ok = await ressourcesRepository.delete(id);
    if (!ok) throw new Error('Ressource introuvable');
    return true;
  }
};
