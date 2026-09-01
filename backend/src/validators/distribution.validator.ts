import { z } from 'zod';

const typeDistributionEnum = z.enum(['perdiem', 'gadget', 'materiel', 'autre']);

export const creerDistributionSchema = z.object({
  type: typeDistributionEnum,
  libelle: z.string().trim().min(1, 'Le libellé est requis').max(200),
  description: z.string().trim().max(2000).nullable().optional(),
  montant: z.coerce.number().nonnegative().nullable().optional(),
  date_distribution: z.coerce.date(),
  beneficiaire_ids: z
    .array(z.coerce.number().int().positive())
    .min(1, 'Sélectionnez au moins un bénéficiaire'),
});

export const modifierDistributionSchema = z.object({
  type: typeDistributionEnum.optional(),
  libelle: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  montant: z.coerce.number().nonnegative().nullable().optional(),
  date_distribution: z.coerce.date().optional(),
}).refine(
  (dto) => Object.keys(dto).length > 0,
  { message: 'Aucun champ à mettre à jour' }
);

export const marquerRecuSchema = z.object({
  utilisateur_id: z.coerce.number().int().positive(),
  recu: z.boolean(),
});
