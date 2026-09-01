import { authRepository } from '../repositories/auth.repository';
import { blogueursRepository } from '../repositories/blogueurs.repository';
import { comparePassword, hashPassword } from '../utils/bcrypt';
import { signToken } from '../utils/jwt';
import { sendResetPasswordEmail } from '../utils/email';
import { JwtPayload } from '../types';
import crypto from 'crypto';

export const authService = {

  async login(email: string, motDePasse: string): Promise<{ token: string; utilisateur: JwtPayload }> {
    const utilisateur = await authRepository.findByEmail(email);
    if (!utilisateur) throw new Error('Email ou mot de passe incorrect');

    const valide = await comparePassword(motDePasse, utilisateur.mot_de_passe);
    if (!valide) throw new Error('Email ou mot de passe incorrect');

    // Projet réservé à un groupe fermé : un blogueur ne peut se connecter
    // que si son compte a été validé (statut 'actif') par un responsable.
    if (utilisateur.role === 'jeune_blogueur') {
      const blogueur = await blogueursRepository.findById(utilisateur.id);

      if (blogueur?.statut === 'en_attente') {
        throw new Error('Votre compte est en attente de validation par un responsable');
      }
      if (blogueur?.statut === 'suspendu') {
        throw new Error('Votre compte a été suspendu. Contactez un responsable.');
      }
      if (blogueur?.statut === 'inactif') {
        throw new Error('Votre compte est inactif. Contactez un responsable.');
      }
    }

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

    if (utilisateur.role !== 'responsable_unicef') {
      const blogueur = await blogueursRepository.findById(id);
      if (blogueur?.numero_urgence) {
        reste.numero_urgence = blogueur.numero_urgence;
      }
    }

    return reste;
  },

  async modifierProfil(id: number, dto: { prenom?: string; nom?: string; telephone?: string; numero_urgence?: string }) {
    await authRepository.updateProfil(id, dto);

    const user = await authRepository.findById(id);
    if (user && user.role !== 'responsable_unicef' && dto.numero_urgence !== undefined) {
      await blogueursRepository.update(id, { numero_urgence: dto.numero_urgence });
    }

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

  async motDePasseOublie(email: string): Promise<void> {
    const utilisateur = await authRepository.findByEmail(email);

    // On ne révèle jamais si l'email existe ou non (anti-énumération)
    if (!utilisateur) return;

    await authRepository.invalidateUserResetTokens(utilisateur.id);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    await authRepository.createResetToken(utilisateur.id, tokenHash, expiresAt);

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:4200').replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;
    await sendResetPasswordEmail(utilisateur.email, utilisateur.prenom, resetUrl);
  },

  async reinitialiserMotDePasse(rawToken: string, nouveauMdp: string): Promise<void> {
    if (nouveauMdp.length < 6) throw new Error('Le mot de passe doit contenir au moins 6 caractères');

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const resetToken = await authRepository.findValidResetToken(tokenHash);

    if (!resetToken) throw new Error('Lien invalide ou expiré');

    const hash = await hashPassword(nouveauMdp);
    await authRepository.updatePassword(resetToken.user_id, hash);
    await authRepository.markResetTokenUsed(resetToken.id);
  },

};
