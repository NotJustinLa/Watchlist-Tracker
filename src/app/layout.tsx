/**
 * Root layout: the outermost shell around every page.
 *
 * It sets up the <html> and <body>, loads the Manrope font and the global
 * styles, and starts the pointer glow behind the dotted background. Every page
 * in the app, signed in or not, renders inside this.
 */

import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import { PointerGlow } from '@/components/PointerGlow';
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
 * Wraps every page with the document shell, font and background glow.
 */
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full`}>
      <body className="min-h-full">
        <PointerGlow />
        {children}
      </body>
    </html>
  );
}
