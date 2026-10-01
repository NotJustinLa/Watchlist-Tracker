'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'motion/react';
import { Bookmark, CircleAlert, Search, Sparkles, X } from 'lucide-react';
import { Button, ButtonLink } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { setOnWatchlist } from '@/app/(app)/movie/[id]/actions';
import type { ReelItem } from '@/lib/reels';

type Decision = 'save' | 'skip';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_IN = [0.55, 0, 1, 0.45] as const;
/** Drag past this (px), or flick faster than this (px/s), to decide. */
const SWIPE_DISTANCE = 110;
const SWIPE_VELOCITY = 600;
/** Fetch the next batch when this many cards are left. */
const PREFETCH_AT = 3;
const LAST_PAGE = 29;

const text = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: EASE_OUT, delay: 0.08 + i * 0.06 },
  }),
};

/**
 * Hinge-style deck: swipe the top card right to add it to your watchlist, left to
 * skip. Buttons and ←/→ do the same. Skips last for this visit only.
 */
export function ReelDeck({ initial }: { initial: ReelItem[] }) {
  const [queue, setQueue] = useState(initial);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [notice, setNotice] = useState<string>();
  const [swiped, setSwiped] = useState(false);
  const page = useRef(1);
  const seen = useRef(new Set(initial.map((item) => item.id)));

  const loadMore = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    // Some batches come back empty once a seed film runs dry: keep going until one has new films.
    while (page.current <= LAST_PAGE) {
      const res = await fetch(`/api/reels?page=${page.current}`).catch(
        () => null,
      );
      if (!res?.ok) {
        setLoadFailed(true);
        break;
      }
      page.current += 1;
      const { items }: { items: ReelItem[] } = await res.json();
      const fresh = items.filter((item) => !seen.current.has(item.id));
      fresh.forEach((item) => seen.current.add(item.id));
      if (fresh.length > 0) {
        setQueue((q) => [...q, ...fresh]);
        break;
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const remaining = queue.length - index;
    if (
      remaining <= PREFETCH_AT &&
      !loading &&
      !loadFailed &&
      page.current <= LAST_PAGE
    ) {
      void loadMore();
    }
  }, [index, queue.length, loading, loadFailed, loadMore]);

  function decide(item: ReelItem, decision: Decision) {
    setSwiped(true);
    setIndex((i) => i + 1);
    if (decision === 'save') {
      setOnWatchlist(item.id, true).catch(() =>
        setNotice(`Couldn’t add ${item.title} to your watchlist.`),
      );
    }
  }

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(undefined), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const current = queue[index];
  const next = queue[index + 1];

  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-x-0 top-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] overflow-hidden md:top-16 md:bottom-0">
        {/* Ambient backdrop from the current film, filling the screen around the column. */}
        <div aria-hidden className="absolute inset-0">
          <AnimatePresence initial={false}>
            {current && (
              <motion.div
                key={current.id}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
              >
                <Image
                  src={current.posterUrl!}
                  alt=""
                  fill
                  sizes="440px"
                  className="scale-125 object-cover blur-[60px] saturate-125"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute inset-0 bg-linear-to-b from-scrim-soft to-bg" />
        </div>

        <div className="relative mx-auto flex h-full max-w-110 flex-col px-3 pt-3 pb-4">
          <div className="flex items-center justify-between pb-3">
            <h1 className="text-title">Reels</h1>
            <p className="text-caption text-muted">
              {swiped ? '' : 'Swipe right to save · left to skip'}
            </p>
          </div>

          <div className="relative flex-1">
            {current ? (
              <>
                {next && <Card key={next.id} item={next} isTop={false} />}
                <Card key={current.id} item={current} isTop onDecide={decide} />
              </>
            ) : loading ? (
              <div
                role="status"
                aria-label="Finding films"
                className="absolute inset-0 rounded-xl bg-raised motion-safe:animate-skeleton"
              />
            ) : loadFailed ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <p className="text-muted">Couldn’t load more films.</p>
                <Button onClick={() => void loadMore()}>Try again</Button>
              </div>
            ) : (
              <EmptyState
                icon={Sparkles}
                title="You’re all caught up"
                body="Rate more films to get fresh picks, or search for something specific."
                action={
                  <ButtonLink href="/" icon={Search}>
                    Search films
                  </ButtonLink>
                }
              />
            )}
          </div>

          {current && (
            <div className="flex items-center justify-center gap-6 pt-4">
              <Button
                size="lg"
                iconOnly
                icon={X}
                aria-label={`Skip ${current.title}`}
                onClick={() => decide(current, 'skip')}
              />
              <Button
                size="lg"
                iconOnly
                icon={Bookmark}
                aria-label={`Add ${current.title} to watchlist`}
                onClick={() => decide(current, 'save')}
              />
            </div>
          )}

          {notice && (
            <p
              role="alert"
              className="absolute inset-x-3 top-14 z-20 flex items-center gap-2 rounded-md bg-scrim px-3 py-2 text-body-sm text-negative backdrop-blur-md"
            >
              <CircleAlert size={16} aria-hidden />
              {notice}
            </p>
          )}
        </div>
      </div>
    </MotionConfig>
  );
}

type CardProps = {
  item: ReelItem;
  isTop: boolean;
  onDecide?: (item: ReelItem, decision: Decision) => void;
};

function Card({ item, isTop, onDecide }: CardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-12, 12]);
  const saveStamp = useTransform(x, [30, SWIPE_DISTANCE], [0, 1]);
  const skipStamp = useTransform(x, [-SWIPE_DISTANCE, -30], [1, 0]);
  const leaving = useRef(false);

  const fling = useCallback(
    async (decision: Decision) => {
      if (leaving.current || !onDecide) return;
      leaving.current = true;
      const width = typeof window === 'undefined' ? 600 : window.innerWidth;
      await animate(x, decision === 'save' ? width : -width, {
        duration: 0.3,
        ease: EASE_IN,
      });
      onDecide(item, decision);
    },
    [item, onDecide, x],
  );

  // ←/→ decide the top card.
  useEffect(() => {
    if (!isTop) return;
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowRight') void fling('save');
      if (e.key === 'ArrowLeft') void fling('skip');
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isTop, fling]);

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) {
      void fling('save');
    } else if (
      info.offset.x < -SWIPE_DISTANCE ||
      info.velocity.x < -SWIPE_VELOCITY
    ) {
      void fling('skip');
    } else {
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 35 });
    }
  }

  const meta = [item.year, item.genres.slice(0, 3).join(', ')]
    .filter(Boolean)
    .join(' · ');

  return (
    <motion.article
      aria-label={`${item.title}${item.year ? `, ${item.year}` : ''}`}
      aria-hidden={!isTop || undefined}
      drag={isTop ? 'x' : false}
      dragMomentum={false}
      onDragEnd={onDragEnd}
      style={{ x, rotate, zIndex: isTop ? 2 : 1 }}
      initial={{ scale: 0.94, opacity: 0 }}
      animate={{ scale: isTop ? 1 : 0.94, opacity: isTop ? 1 : 0.6 }}
      transition={{ duration: 0.36, ease: EASE_OUT }}
      className={`absolute inset-0 isolate flex touch-pan-y flex-col justify-end overflow-hidden rounded-xl border border-line bg-surface select-none ${isTop ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
    >
      <Image
        src={item.posterUrl!}
        alt=""
        fill
        sizes="440px"
        draggable={false}
        className="-z-20 scale-140 object-cover blur-[36px] saturate-125"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-scrim-soft via-transparent via-30% to-bg to-80%" />

      <div className="absolute inset-x-0 top-6 flex justify-center">
        <div className="relative aspect-2/3 w-[52%] max-w-60 overflow-hidden rounded-lg shadow-poster">
          <Image
            src={item.posterUrl!}
            alt={`${item.title} poster`}
            fill
            sizes="240px"
            draggable={false}
            priority={isTop}
            className="object-cover"
          />
        </div>
      </div>

      {/* Stamps that fade in as you drag. */}
      <motion.span
        aria-hidden
        style={{ opacity: saveStamp }}
        className="absolute top-6 left-5 flex -rotate-12 items-center gap-1.5 rounded-md border-2 border-ink bg-scrim px-3 py-1.5 text-label uppercase"
      >
        <Bookmark size={16} /> Save
      </motion.span>
      <motion.span
        aria-hidden
        style={{ opacity: skipStamp }}
        className="absolute top-6 right-5 flex rotate-12 items-center gap-1.5 rounded-md border-2 border-muted bg-scrim px-3 py-1.5 text-label text-muted uppercase"
      >
        <X size={16} /> Skip
      </motion.span>

      <motion.div
        initial="hidden"
        animate={isTop ? 'show' : 'hidden'}
        className="flex flex-col gap-2 p-4"
      >
        <motion.p
          custom={0}
          variants={text}
          className="flex items-start gap-2 self-start rounded-md bg-scrim px-2.5 py-1.5 text-body-sm font-semibold backdrop-blur-md"
        >
          <Sparkles size={15} aria-hidden className="mt-px flex-none" />
          {item.reason}
        </motion.p>
        <motion.h2 custom={1} variants={text}>
          <Link
            href={`/movie/${item.id}`}
            draggable={false}
            className="text-[28px] leading-8 font-extrabold tracking-[-0.02em] hover:underline"
          >
            {item.title}
          </Link>
        </motion.h2>
        {meta && (
          <motion.p
            custom={2}
            variants={text}
            className="text-body-sm text-muted"
          >
            {meta}
          </motion.p>
        )}
        {item.overview && (
          <motion.p
            custom={3}
            variants={text}
            className="line-clamp-3 text-body-sm"
          >
            {item.overview}
          </motion.p>
        )}
      </motion.div>
    </motion.article>
  );
}
