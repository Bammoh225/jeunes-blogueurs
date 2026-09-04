import { Response } from 'express';
import { ApiResponse } from '../types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Succès',
  statusCode = 200,
  meta?: { total: number; page: number; limit: number; totalPages: number }
): Response {
  const body: ApiResponse<T> = { success: true, message, data, meta };
  return res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  errors?: string[]
): Response {
  const body: ApiResponse = { success: false, message, errors };
  return res.status(statusCode).json(body);
}