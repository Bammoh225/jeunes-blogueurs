import { villesRepository } from '../repositories/villes.repository';

export const villesService = {
  async lister() {
    return villesRepository.findAll();
  },

  async trouver(id: number) {
    const v = await villesRepository.findById(id);
    if (!v) throw new Error('Ville introuvable');
    return v;
  },
};
