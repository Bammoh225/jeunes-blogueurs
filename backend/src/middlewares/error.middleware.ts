import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

// Middleware de gestion globale des erreurs (doit être déclaré en dernier dans app.ts)
export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Erreur serveur]', err.message);
  sendError(res, 'Erreur interne du serveur', 500);
}
