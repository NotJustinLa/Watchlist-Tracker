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

export const watchlistSortSchema = z.enum(['added', 'title']).catch('added');

export const watchedSortSchema = z
  .enum(['recent', 'rating', 'title'])
  .catch('recent');

export const starFilterSchema = z.coerce
  .number()
  .pipe(ratingSchema)
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
