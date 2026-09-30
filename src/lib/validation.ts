import { z } from 'zod';

export const searchQuerySchema = z.string().trim().max(100).catch('');

export const tmdbIdSchema = z
  .string()
  .regex(/^[1-9]\d{0,8}$/)
  .transform(Number);
