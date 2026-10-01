/**
 * The summary card on the Taste page, with its Generate / Regenerate button.
 */

'use client';

import { useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/Skeleton';

type Profile = { summary: string; ratingCount: number; newRatings: number };

/**
 * Shows your taste summary and asks the server for a new one when you press the
 * button.
 *
 * While it's thinking you see a calm "Thinking about your ratings…" and
 * placeholder picks. If it fails you get a message and a way to try again; if
 * you pressed it too recently you're told to wait a minute.
 */
export function TasteGenerator({
  profile,
  children,
}: {
  profile: Profile | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const [generating, startTransition] = useTransition();
  const [error, setError] = useState<{ status: number; message: string }>();

  function generate() {
    setError(undefined);
    startTransition(async () => {
      const res = await fetch('/api/taste', { method: 'POST' }).catch(
        () => null,
      );
      if (!res?.ok) {
        const body: { error?: string } | null = await res
          ?.json()
          .catch(() => null);
        setError({
          status: res?.status ?? 0,
          message: body?.error ?? 'Check your connection and try again.',
        });
        return;
      }
      startTransition(() => router.refresh());
    });
  }

  const cooldown = error?.status === 429;

  return (
    <>
      <section className="flex flex-col items-start gap-4 rounded-lg border border-line bg-surface p-4 md:p-6">
        <h2 className="flex items-center gap-2 text-overline text-muted uppercase">
          <Sparkles
            size={14}
            aria-hidden
            className={generating ? 'motion-safe:animate-skeleton' : undefined}
          />
          Your taste
        </h2>
        {generating ? (
          <p
            role="status"
            className="text-[19px] leading-6.75 font-bold text-muted"
          >
            Thinking about your ratings…
          </p>
        ) : profile ? (
          <>
            <p className="text-[19px] leading-6.75 font-bold">
              {profile.summary}
            </p>
            <p className="text-body-sm text-muted">
              Based on {profile.ratingCount} ratings
              {profile.newRatings > 0 &&
                ` · You’ve rated ${profile.newRatings} more since`}
            </p>
          </>
        ) : (
          <p className="text-muted">
            Get a short read on what you like and a few films picked for you.
          </p>
        )}
        {cooldown && (
          <p role="status" className="text-body-sm text-muted">
            {error.message}
          </p>
        )}
        <Button icon={Sparkles} loading={generating} onClick={generate}>
          {generating
            ? 'Thinking'
            : profile
              ? 'Regenerate'
              : 'Generate my taste profile'}
        </Button>
      </section>

      {generating ? (
        <RecommendationSkeletons />
      ) : error && !cooldown ? (
        <ErrorState
          title="Couldn’t build your taste profile"
          body={error.message}
          onRetry={generate}
        />
      ) : (
        children
      )}
    </>
  );
}

/**
 * Three placeholder recommendation rows, shown while picks are loading.
 */
export function RecommendationSkeletons() {
  return (
    <div
      role="status"
      aria-label="Loading recommendations"
      className="grid gap-3 md:grid-cols-2"
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex gap-4 rounded-lg border border-line bg-surface p-3"
        >
          <Skeleton rounded="md" className="aspect-2/3 w-19 flex-none" />
          <div className="flex flex-1 flex-col gap-2 pt-1">
            <Skeleton className="h-3.5 w-3/5" />
            <Skeleton className="h-2.5 w-2/5" />
            <Skeleton className="h-2.5" />
            <Skeleton className="h-2.5 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
