import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { sendError } from '../utils/response';

// Valide req.body avec un schéma Zod
// Usages : router.post('/', authMiddleware, validateBody(creerPublicationSchema), controller)
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map(
        (e) => `${e.path.join('.')}: ${e.message}`
      );
      sendError(res, 'Données invalides', 422, errors);
      return;
    }

    req.body = result.data; // Remplace le body par les données validées et typées
    next();
  };
}
