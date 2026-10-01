/**
 * Root layout: the outermost shell around every page.
 *
 * It sets up the <html> and <body>, loads the Manrope font and the global
 * styles, starts the pointer glow behind the dotted background, and plays the
 * launch splash the first time you open Reel in a session. Every page in the
 * app, signed in or not, renders inside this.
 */

import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import { PointerGlow } from '@/components/PointerGlow';
import { SPLASH_SCRIPT, Splash } from '@/components/Splash';
import { getPopular } from '@/lib/tmdb';
import './globals.css';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Reel',
  description: 'Movie watchlist and rating tracker',
};

/**
 * Wraps every page with the document shell, font, background glow and splash.
 */
export default async function RootLayout({ children }: LayoutProps<'/'>) {
  // The splash's poster wall is decoration: if TMDB is down, it's just empty.
  const posters = await getPopular()
    .then((movies) => movies.flatMap((movie) => movie.posterUrl ?? []))
    .catch(() => []);

  return (
    // The splash script may mark <html> before React loads, so allow that difference.
    <html
      lang="en"
      className={`${manrope.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SPLASH_SCRIPT }} />
      </head>
      <body className="min-h-full">
        <Splash posters={posters.slice(0, 16)} />
        <PointerGlow />
        {children}
      </body>
    </html>
  );
}
