import { z } from 'zod';

const typeActiviteEnum = z.enum(['atelier', 'formation', 'evenement', 'autre']);
const statutActiviteEnum = z.enum(['planifiee', 'en_cours', 'terminee', 'annulee']);
const visibiliteEnum = z.enum(['ville', 'designee']);

export const creerActiviteSchema = z.object({
  ville_id: z.coerce.number().int().positive(),
  titre: z.string().trim().min(1, 'Le titre est requis').max(200),
  description: z.string().trim().max(2000).nullable().optional(),
  type: typeActiviteEnum,
  date_debut: z.coerce.date(),
  date_fin: z.coerce.date().nullable().optional(),
  lieu: z.string().trim().max(255).nullable().optional(),
  capacite_max: z.coerce.number().int().positive().nullable().optional(),
  visibilite: visibiliteEnum.optional(),
  participant_ids: z.array(z.coerce.number().int().positive()).optional(),
}).refine(
  (dto) => !dto.date_fin || dto.date_fin >= dto.date_debut,
  { message: 'La date de fin doit être après la date de début', path: ['date_fin'] }
);

export const modifierActiviteSchema = z.object({
  titre: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  type: typeActiviteEnum.optional(),
  date_debut: z.coerce.date().optional(),
  date_fin: z.coerce.date().nullable().optional(),
  lieu: z.string().trim().max(255).nullable().optional(),
  capacite_max: z.coerce.number().int().positive().nullable().optional(),
  statut: statutActiviteEnum.optional(),
  rapport: z.string().trim().max(5000).nullable().optional(),
}).refine(
  (dto) => Object.keys(dto).length > 0,
  { message: 'Aucun champ à mettre à jour' }
);

export const ajouterParticipantSchema = z.object({
  utilisateur_id: z.coerce.number().int().positive(),
});

export const confirmerPresenceSchema = z.object({
  present: z.boolean(),
});

export const marquerPresenceSchema = z.object({
  utilisateur_id: z.coerce.number().int().positive(),
  present: z.boolean(),
});
