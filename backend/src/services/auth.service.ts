import { authRepository } from '../repositories/auth.repository';
import { comparePassword, hashPassword } from '../utils/bcrypt';
import { signToken } from '../utils/jwt';
import { JwtPayload } from '../types';

export const authService = {

  async login(email: string, motDePasse: string): Promise<{ token: string; utilisateur: JwtPayload }> {
    const utilisateur = await authRepository.findByEmail(email);
    if (!utilisateur) throw new Error('Email ou mot de passe incorrect');

    const valide = await comparePassword(motDePasse, utilisateur.mot_de_passe);
    if (!valide) throw new Error('Email ou mot de passe incorrect');

    const payload: JwtPayload = {
      id:           utilisateur.id,
      email:        utilisateur.email,
      prenom:       utilisateur.prenom,
      nom:          utilisateur.nom,
      role:         utilisateur.role,
      ville_id:     utilisateur.ville_id,
      categorie_id: utilisateur.categorie_id,
    };

    const token = signToken(payload);
    return { token, utilisateur: payload };
  },

  async profil(id: number) {
    const utilisateur = await authRepository.findById(id);
    if (!utilisateur) throw new Error('Utilisateur introuvable');
    const { mot_de_passe: _, ...reste } = utilisateur;
    return reste;
  },

  async modifierProfil(id: number, dto: { prenom?: string; nom?: string; telephone?: string }) {
    await authRepository.updateProfil(id, dto);
    return authService.profil(id);
  },

  async changerMotDePasse(id: number, ancienMdp: string, nouveauMdp: string) {
    const utilisateur = await authRepository.findById(id);
    if (!utilisateur) throw new Error('Utilisateur introuvable');

    const valide = await comparePassword(ancienMdp, utilisateur.mot_de_passe);
    if (!valide) throw new Error('Ancien mot de passe incorrect');

    if (nouveauMdp.length < 6) throw new Error('Le mot de passe doit contenir au moins 6 caractères');

    const hash = await hashPassword(nouveauMdp);
    await authRepository.updatePassword(id, hash);
  },

};
