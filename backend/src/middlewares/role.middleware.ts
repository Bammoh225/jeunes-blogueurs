import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { Role } from '../types';
import { sendError } from '../utils/response';

// Usages :
//   router.get('/', authMiddleware, requireRoles('responsable_unicef', 'responsable_national'), ...)
//   router.post('/', authMiddleware, requireRoles('jeune_blogueur'), ...)
export function requireRoles(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Non authentifié', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 'Accès refusé : permissions insuffisantes', 403);
      return;
    }

    next();
  };
}

// Raccourcis utiles
export const adminOnly = requireRoles('responsable_unicef', 'responsable_technique');

export const managementRoles = requireRoles(
  'responsable_unicef',
  'responsable_technique',
  'responsable_national'
);

export const allStaff = requireRoles(
  'responsable_unicef',
  'responsable_technique',
  'responsable_national',
  'responsable_zone',
  'responsable_categorie',
  'equipe_com'
);
