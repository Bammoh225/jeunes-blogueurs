import { z } from 'zod';

// Regex simple pour les numéros de téléphone ivoiriens/internationaux
// (chiffres, espaces, +, 8 à 15 chiffres utiles)
const telephoneRegex = /^\+?[0-9\s]{8,20}$/;

export const inscrireBlogueurSchema = z.object({
  // --- Partie utilisateur ---
  prenom: z.string().trim().min(1, 'Le prénom est requis').max(100),
  nom: z.string().trim().min(1, 'Le nom est requis').max(100),
  email: z.string().trim().email('Email invalide').max(255).toLowerCase(),
  mot_de_passe: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(100),
  telephone: z
    .string()
    .trim()
    .regex(telephoneRegex, 'Numéro de téléphone invalide')
    .optional(),

  // Obligatoire — correspond à profils_blogueurs.numero_urgence
  numero_urgence: z
    .string()
    .trim()
    .regex(telephoneRegex, 'Numéro d\'urgence invalide'),

  ville_id: z.coerce.number().int().positive().nullable().optional(),
  categorie_id: z.coerce.number().int().positive().nullable().optional(),

  // --- Partie profil blogueur ---
  date_naissance: z.coerce.date().refine(
    (d) => d < new Date(),
    'La date de naissance doit être dans le passé'
  ),
  sexe: z.enum(['M', 'F'], { errorMap: () => ({ message: "Le sexe doit être 'M' ou 'F'" }) }),
  bio: z.string().trim().max(2000).optional(),
  niveau_scolaire: z.string().trim().max(150).optional(),
  etablissement: z.string().trim().max(200).optional(),
  experience: z.string().trim().max(2000).optional(),
  langue_ecriture: z.string().trim().min(1).max(50),
  motivation: z.string().trim().max(2000).optional(),
  lien_portfolio: z.string().trim().url('URL de portfolio invalide').max(500).optional(),
  presentation: z.string().trim().max(2000).optional(),

  // --- Thématiques ---
  thematique_ids: z
    .array(z.coerce.number().int().positive())
    .min(1, 'Choisissez au moins une thématique')
    .max(3, 'Maximum 3 thématiques'),
});

export type InscrireBlogueurInput = z.infer<typeof inscrireBlogueurSchema>;

export const modifierBlogueurSchema = z.object({
  prenom: z.string().trim().min(1).max(100).optional(),
  nom: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().email().max(255).toLowerCase().optional(),
  mot_de_passe: z.string().min(8).max(100).optional(),
  telephone: z.string().trim().regex(telephoneRegex).optional(),
  photo_url: z.string().trim().url().max(500).nullable().optional(),
  ville_id: z.coerce.number().int().positive().nullable().optional(),
  categorie_id: z.coerce.number().int().positive().nullable().optional(),

  date_naissance: z.coerce.date().refine((d) => d < new Date()).optional(),
  sexe: z.enum(['M', 'F']).optional(),
  statut: z.enum(['en_attente', 'actif', 'inactif', 'suspendu']).optional(),
  bio: z.string().trim().max(2000).optional(),
  niveau_scolaire: z.string().trim().max(150).optional(),
  etablissement: z.string().trim().max(200).optional(),
  experience: z.string().trim().max(2000).optional(),
  langue_ecriture: z.string().trim().min(1).max(50).optional(),
  motivation: z.string().trim().max(2000).optional(),
  numero_urgence: z.string().trim().regex(telephoneRegex).optional(),
  lien_portfolio: z.string().trim().url().max(500).optional(),
  presentation: z.string().trim().max(2000).optional(),

  thematique_ids: z.array(z.coerce.number().int().positive()).max(3).optional(),
});

export const changerStatutSchema = z.object({
  statut: z.enum(['en_attente', 'actif', 'inactif', 'suspendu'], {
    errorMap: () => ({ message: 'Statut invalide' }),
  }),
});
