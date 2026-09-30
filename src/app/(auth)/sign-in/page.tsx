import { CircleAlert } from 'lucide-react';
import { Button } from '@/components/Button';
import {
  DiscordLogo,
  GitHubLogo,
  GoogleLogo,
} from '@/components/ProviderLogos';
import { signIn } from '../actions';

const providers = [
  { id: 'google', name: 'Google', Logo: GoogleLogo },
  { id: 'github', name: 'GitHub', Logo: GitHubLogo },
  { id: 'discord', name: 'Discord', Logo: DiscordLogo },
];

export default async function SignInPage({
  searchParams,
}: PageProps<'/sign-in'>) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-dvh flex-col justify-end px-4 pt-6 pb-8 md:justify-center">
      <div className="mx-auto flex w-full max-w-100 flex-col gap-6">
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
