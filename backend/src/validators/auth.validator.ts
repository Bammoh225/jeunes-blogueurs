import { z } from 'zod';

const telephoneRegex = /^\+?[0-9\s]{8,20}$/;
const MOT_DE_PASSE_MIN = 8;

export const loginSchema = z.object({
  email: z.string().trim().email('Email invalide').max(255).toLowerCase(),
  mot_de_passe: z.string().min(1, 'Mot de passe requis').max(100),
});

export const modifierProfilSchema = z.object({
  prenom: z.string().trim().min(1).max(100).optional(),
  nom: z.string().trim().min(1).max(100).optional(),
  telephone: z.string().trim().regex(telephoneRegex, 'Numéro de téléphone invalide').optional(),
  numero_urgence: z.string().trim().regex(telephoneRegex, "Numéro d'urgence invalide").optional(),
}).refine(
  (dto) => Object.keys(dto).length > 0,
  { message: 'Aucun champ à mettre à jour' }
);

export const changerMotDePasseSchema = z.object({
  ancien_mot_de_passe: z.string().min(1, 'Ancien mot de passe requis').max(100),
  nouveau_mot_de_passe: z
    .string()
    .min(MOT_DE_PASSE_MIN, `Le mot de passe doit contenir au moins ${MOT_DE_PASSE_MIN} caractères`)
    .max(100),
});

export const motDePasseOublieSchema = z.object({
  email: z.string().trim().email('Email invalide').max(255).toLowerCase(),
});

export const reinitialiserMotDePasseSchema = z.object({
  token: z.string().min(1, 'Token requis').max(500),
  nouveau_mot_de_passe: z
    .string()
    .min(MOT_DE_PASSE_MIN, `Le mot de passe doit contenir au moins ${MOT_DE_PASSE_MIN} caractères`)
    .max(100),
});
