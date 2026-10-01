import 'server-only';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { tasteResponseSchema } from './validation';

/** Fewer ratings than this and there's no pattern worth summarising. */
export const MIN_RATINGS = 5;

export type RatedFilm = {
  title: string;
  year: number | null;
  genres: string[];
  rating: number;
};

export type TasteResponse = z.infer<typeof tasteResponseSchema>;

// Retries transient failures (e.g. 503 "high demand") with a short backoff.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { retryOptions: { attempts: 3, initialDelay: 1, maxDelay: 4 } },
});

const responseJsonSchema = z.toJSONSchema(tasteResponseSchema);

/** Asks Gemini for a taste summary and recommendations. `history` is sorted by rating. */
export async function generateTasteProfile(
  history: RatedFilm[],
): Promise<TasteResponse> {
  const films = history
    .map((f) => {
      const year = f.year ? ` (${f.year})` : '';
      const genres = f.genres.length ? ` [${f.genres.join(', ')}]` : '';
      return `- ${f.title}${year}${genres}: ${f.rating}/5`;
    })
    .join('\n');

  const prompt = `You are a film critic writing a short taste profile for one person, based on films they rated from 1 (disliked) to 5 (loved).

Their ratings, highest first:
${films}

Return:
- summary: one or two plain sentences in the second person ("You ...") contrasting what they rate highly with what they rate low. Be specific about genres, tone or named films. No exclamation marks.
- recommendations: 3 to 5 feature films that are NOT in the list above. Give each film's original release title, its release year, and a one-sentence reason that names at least one specific film from their ratings.`;

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL!,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema,
      abortSignal: AbortSignal.timeout(30_000),
    },
  });

  // Never trust the model: the shape is checked even with a response schema.
  return tasteResponseSchema.parse(JSON.parse(response.text ?? ''));
}
