import { z } from 'zod';

const champsCommuns = {
  categorie_id: z.coerce.number().int().positive(),
  thematique_id: z.coerce.number().int().positive(),
  titre: z.string().trim().min(1, 'Le titre est requis').max(200),
  lien: z.string().trim().url('Le lien doit être une URL valide').max(1000),
  description: z.string().trim().max(2000).nullable().optional(),
  date_publication: z.coerce.date(),
  blog_nb_mots: z.coerce.number().int().nonnegative().nullable().optional(),
  vlog_plateforme: z.string().trim().max(100).nullable().optional(),
  vlog_duree_minutes: z.coerce.number().int().nonnegative().nullable().optional(),
  podcast_plateforme: z.string().trim().max(100).nullable().optional(),
  podcast_duree_min: z.coerce.number().int().nonnegative().nullable().optional(),
  podcast_invites: z.string().trim().max(500).nullable().optional(),
  bd_nb_planches: z.coerce.number().int().nonnegative().nullable().optional(),
  bd_outil: z.string().trim().max(100).nullable().optional(),
};

export const creerPublicationSchema = z.object(champsCommuns);

export const modifierPublicationSchema = z.object(
  Object.fromEntries(
    Object.entries(champsCommuns).map(([k, schema]) => [k, (schema as z.ZodTypeAny).optional()])
  )
).refine(
  (dto) => Object.keys(dto).length > 0,
  { message: 'Aucun champ à mettre à jour' }
);
