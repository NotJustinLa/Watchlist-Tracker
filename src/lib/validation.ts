import { z } from 'zod';

export const searchQuerySchema = z.string().trim().max(100).catch('');

// Member search: a leading @ is ignored so "@maya" and "maya" match the same.
export const memberQuerySchema = z
  .string()
  .trim()
  .transform((q) => q.replace(/^@/, ''))
  .pipe(z.string().max(50))
  .catch('');

// Fits the Postgres `integer` column.
export const tmdbIdSchema = z.number().int().min(1).max(999_999_999);

export const tmdbIdParamSchema = z
  .string()
  .regex(/^[1-9]\d*$/)
  .transform(Number)
  .pipe(tmdbIdSchema);

export const ratingSchema = z.number().int().min(1).max(5);

// Handles are stored lowercase; input is normalised before the format check.
export const handleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,20}$/, '3–20 characters: letters, numbers and _');

export const profileTabSchema = z
  .enum(['watched', 'watchlist'])
  .catch('watched');

export const settingsSchema = z.object({
  handle: handleSchema,
  displayName: z
    .string()
    .trim()
    .min(1, 'Enter a name')
    .max(50, 'At most 50 characters'),
  isPrivate: z.enum(['true', 'false']).transform((v) => v === 'true'),
});

export const watchlistSortSchema = z.enum(['added', 'title']).catch('added');

export const watchedSortSchema = z
  .enum(['recent', 'rating', 'title'])
  .catch('recent');

// Watched page filter: a star count, or films not rated yet.
export const watchedFilterSchema = z
  .union([z.literal('unrated'), z.coerce.number().pipe(ratingSchema)])
  .optional()
  .catch(undefined);

// What Gemini must return. Also sent to Gemini as the response JSON schema.
export const tasteResponseSchema = z.object({
  summary: z.string().trim().min(1).max(400),
  recommendations: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(200),
        year: z.number().int().min(1870).max(2100),
        reason: z.string().trim().min(1).max(300),
      }),
    )
    .min(3)
    .max(5),
});

// Recommendations as stored in `taste_profiles.recommendations`, resolved against TMDB.
export const storedRecommendationsSchema = z.array(
  z.object({
    tmdbId: tmdbIdSchema,
    title: z.string(),
    year: z.number().nullable(),
    posterUrl: z.string().nullable(),
    reason: z.string(),
  }),
);

/**
 * What a server action returns for a problem the caller can fix (bad input, an
 * unknown film or handle). Genuine server failures still throw.
 */
export type ActionError = { error: string };
export const invalidInput: ActionError = { error: 'Invalid input.' };
