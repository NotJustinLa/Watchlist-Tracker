/**
 * Sign-in page (`/sign-in`).
 *
 * This is the front door. You pick Google, GitHub or Discord to sign in; there
 * are no passwords. Behind the buttons sits a tilted wall of popular posters,
 * which simply doesn't appear if the movie database is unavailable.
 */

import { CircleAlert } from 'lucide-react';
import { Button } from '@/components/Button';
import {
  DiscordLogo,
  GitHubLogo,
  GoogleLogo,
} from '@/components/ProviderLogos';
import { Poster } from '@/components/PosterCard';
import { getPopular } from '@/lib/tmdb';
import { signIn } from '../actions';

const providers = [
  { id: 'google', name: 'Google', Logo: GoogleLogo },
  { id: 'github', name: 'GitHub', Logo: GitHubLogo },
  { id: 'discord', name: 'Discord', Logo: DiscordLogo },
];

/**
 * Shows the logo, a one-line pitch, the three provider buttons and any sign-in
 * error.
 */
export default async function SignInPage({
  searchParams,
}: PageProps<'/sign-in'>) {
  const { error } = await searchParams;
  // The poster wall is decoration: if TMDB is down, sign-in still works.
  const wall = await getPopular().catch(() => []);

  return (
    <main className="relative flex min-h-dvh flex-col justify-end overflow-hidden px-4 pt-6 pb-8 md:justify-center">
      <div
        aria-hidden
        className="absolute inset-x-[-40px] top-[-40px] grid -rotate-8 grid-cols-4 gap-2.5 opacity-50 md:grid-cols-8 after:absolute after:inset-0 after:bg-linear-to-b after:from-bg/10 after:to-bg after:to-88%"
      >
        {wall.slice(0, 16).map((movie) => (
          <Poster
            key={movie.id}
            url={movie.posterUrl}
            sizes="(min-width: 768px) 13vw, 26vw"
          />
        ))}
      </div>
      <div className="relative mx-auto flex w-full max-w-100 flex-col gap-6">
        <div>
          <h1 className="text-[44px] leading-none font-extrabold tracking-[-0.03em]">
            Reel<span className="text-accent">.</span>
          </h1>
          <p className="mt-3 text-title font-semibold text-muted">
            Rate what you watch. See what your friends loved.
          </p>
        </div>
        {error && (
          <p
            role="alert"
            className="flex items-center gap-1.5 text-body-sm text-negative"
          >
            <CircleAlert size={16} aria-hidden />
            Sign-in didn’t complete. Try again.
          </p>
        )}
        <form action={signIn} className="flex flex-col gap-2">
          {providers.map(({ id, name, Logo }) => (
            <Button
              key={id}
              type="submit"
              name="provider"
              value={id}
              size="lg"
              className="w-full"
            >
              <span className="flex w-full items-center gap-3">
                <Logo />
                Continue with {name}
              </span>
            </Button>
          ))}
        </form>
        <p className="text-body-sm text-muted">
          No passwords. We only use your provider to sign you in.
        </p>
      </div>
    </main>
  );
}
