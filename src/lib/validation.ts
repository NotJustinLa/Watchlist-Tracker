import { z } from 'zod';

export const searchQuerySchema = z.string().trim().max(100).catch('');

// Fits the Postgres `integer` column.
export const tmdbIdSchema = z.number().int().min(1).max(999_999_999);

export const tmdbIdParamSchema = z
  .string()
  .regex(/^[1-9]\d*$/)
  .transform(Number)
  .pipe(tmdbIdSchema);

export const ratingSchema = z.number().int().min(1).max(5);
