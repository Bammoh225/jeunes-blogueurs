import { z } from 'zod';

export const evaluerSchema = z.object({
  publication_id: z.coerce.number().int().positive(),
  retenu_reseaux: z.boolean(),
  commentaire: z.string().trim().max(2000).nullable().optional(),
  reseau_utilise: z.string().trim().max(100).nullable().optional(),
  date_utilisation: z.coerce.date().nullable().optional(),
});
