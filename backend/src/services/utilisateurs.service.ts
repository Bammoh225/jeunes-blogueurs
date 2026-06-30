import { utilisateursRepository } from '../repositories/utilisateurs.repository';
import { CreateUtilisateurDto, UpdateUtilisateurDto } from '../models/utilisateur.model';
import { hashPassword } from '../utils/bcrypt';

export const utilisateursService = {

  async lister() {
    return utilisateursRepository.findAll();
  },

  async trouver(id: number) {
    const u = await utilisateursRepository.findById(id);
    if (!u) throw new Error('Utilisateur introuvable');
    return u;
  },

  async creer(dto: CreateUtilisateurDto) {
    const existe = await utilisateursRepository.emailExists(dto.email);
    if (existe) throw new Error('Cet email est déjà utilisé');

    const hash = await hashPassword(dto.mot_de_passe);
    const id = await utilisateursRepository.create({ ...dto, mot_de_passe: hash });
    return utilisateursRepository.findById(id);
  },

  async modifier(id: number, dto: UpdateUtilisateurDto) {
    await utilisateursRepository.update(id, dto);
    return utilisateursRepository.findById(id);
  },

  async desactiver(id: number) {
    const ok = await utilisateursRepository.deactivate(id);
    if (!ok) throw new Error('Utilisateur introuvable');
  },

};
