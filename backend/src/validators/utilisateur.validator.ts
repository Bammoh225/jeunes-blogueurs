import { z } from 'zod';

const telephoneRegex = /^\+?[0-9\s]{8,20}$/;

const roleEnum = z.enum([
  'responsable_unicef',
  'responsable_technique',
  'responsable_national',
  'responsable_zone',
  'responsable_categorie',
  'equipe_com',
  'jeune_blogueur',
], { errorMap: () => ({ message: 'Rôle invalide' }) });

export const creerUtilisateurSchema = z.object({
  prenom: z.string().trim().min(1, 'Le prénom est requis').max(100),
  nom: z.string().trim().min(1, 'Le nom est requis').max(100),
  email: z.string().trim().email('Email invalide').max(255).toLowerCase(),
  mot_de_passe: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(100),
  role: roleEnum.optional(),
  telephone: z.string().trim().regex(telephoneRegex, 'Numéro de téléphone invalide').optional(),
  numero_urgence: z.string().trim().regex(telephoneRegex, "Numéro d'urgence invalide").optional(),
  ville_id: z.coerce.number().int().positive().nullable().optional(),
  categorie_id: z.coerce.number().int().positive().nullable().optional(),
});

export const modifierUtilisateurSchema = z.object({
  prenom: z.string().trim().min(1).max(100).optional(),
  nom: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().email().max(255).toLowerCase().optional(),
  mot_de_passe: z.string().min(8).max(100).optional(),
  role: roleEnum.optional(),
  telephone: z.string().trim().regex(telephoneRegex).optional(),
  numero_urgence: z.string().trim().regex(telephoneRegex).optional(),
  ville_id: z.coerce.number().int().positive().nullable().optional(),
  categorie_id: z.coerce.number().int().positive().nullable().optional(),
}).refine(
  (dto) => Object.keys(dto).length > 0,
  { message: 'Aucun champ à mettre à jour' }
);
