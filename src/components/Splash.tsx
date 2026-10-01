/**
 * The launch splash you see once when you first open Reel.
 *
 * Columns of popular posters slide up, "Reel" rises letter by letter, the yellow
 * full stop pops, and a tagline fades in. After about a second it gently grows
 * and fades away to reveal the page. It only plays once per browser session.
 */

'use client';

import Image from 'next/image';
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from 'react';

/** Runs before the page paints: marks the page if the splash already played. */
export const SPLASH_SCRIPT = `try{sessionStorage.getItem('reel-splash')?document.documentElement.dataset.splash='seen':sessionStorage.setItem('reel-splash','1')}catch(e){document.documentElement.dataset.splash='seen'}`;

const HOLD_MS = 900;
const EXIT_MS = 360;
const COLUMN_OFFSETS = ['0%', '-40%', '-15%', '-55%'];

const noSubscribe = () => () => {};
const index = (i: number) => ({ '--i': i }) as CSSProperties;

/**
 * Plays the splash on your first page load of the session, then removes itself.
 *
 * `posters` are popular poster images for the background wall. If the movie
 * database is down there are none, and the splash shows just the wordmark.
 */
export function Splash({ posters }: { posters: string[] }) {
  // Whether the splash already played this session (set by SPLASH_SCRIPT).
  const seen = useSyncExternalStore(
    noSubscribe,
    () => document.documentElement.dataset.splash === 'seen',
    () => false,
  );
  const [phase, setPhase] = useState<'show' | 'leave' | 'gone'>('show');

  useEffect(() => {
    if (seen) return;
    const leave = setTimeout(() => setPhase('leave'), HOLD_MS);
    const gone = setTimeout(() => setPhase('gone'), HOLD_MS + EXIT_MS);
    return () => {
      clearTimeout(leave);
      clearTimeout(gone);
    };
  }, [seen]);

  if (seen || phase === 'gone') return null;

  const columns = COLUMN_OFFSETS.map((_, c) =>
    posters.filter((_, i) => i % COLUMN_OFFSETS.length === c),
  );

  return (
    <div
      role="status"
      aria-label="Loading Reel"
      className={`splash fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-bg transition duration-360 ease-in ${phase === 'leave' ? 'scale-104 opacity-0' : ''}`}
    >
      <div
        aria-hidden
        className="absolute -inset-x-[10%] -inset-y-[6%] grid grid-cols-4 gap-2.5 opacity-55"
      >
        {columns.map((column, c) => (
          <div
            key={c}
            style={{ ...index(c), marginTop: COLUMN_OFFSETS[c] }}
            className="splash-column flex flex-col gap-2.5"
          >
            {column.map((url) => (
              <div
                key={url}
                className="relative aspect-2/3 overflow-hidden rounded-lg bg-raised"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="25vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(closest-side,var(--color-bg)_25%,var(--color-scrim-soft)_70%,var(--color-bg))]"
      />
      <div className="relative flex flex-col items-center gap-3.5">
        <p
          aria-hidden
          className="flex text-[76px] leading-none font-extrabold tracking-[-0.04em]"
        >
          {'Reel'.split('').map((letter, i) => (
            <span
              key={i}
              style={index(i)}
              className="splash-letter inline-block"
            >
              {letter}
            </span>
          ))}
          <span className="splash-dot inline-block text-accent">.</span>
        </p>
        <p className="splash-tagline text-label text-muted">
          Find your next favourite film.
        </p>
      </div>
    </div>
  );
}
