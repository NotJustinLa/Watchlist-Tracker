/**
 * Profile page (`/u/<handle>`).
 *
 * Anyone's profile, including yours: their avatar, name, follower counts, stats
 * (films watched, average rating, a chart of their ratings) and their Watched
 * and Watchlist tabs. If the account is private and you're not an approved
 * follower, you only see a lock and a Request to follow button; their films
 * never reach you.
 */

import { notFound } from 'next/navigation';
import { Bookmark, Eye, Inbox, Lock, Settings } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { ButtonLink } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { FollowButton, type Relationship } from '@/components/FollowButton';
import { PosterCard } from '@/components/PosterCard';
import { PosterGrid } from '@/components/PosterGrid';
import { ProfileStats } from '@/components/ProfileStats';
import { Segmented } from '@/components/Segmented';
import { getPendingRequestCount } from '@/lib/follows';
import { createClient } from '@/lib/supabase/server';
import { posterUrl } from '@/lib/tmdb';
import { handleSchema, profileTabSchema } from '@/lib/validation';

/**
 * Loads the profile and decides whether to show everything or the private lock.
 */
export default async function ProfilePage({
  params,
  searchParams,
}: PageProps<'/u/[handle]'>) {
  const handle = handleSchema.safeParse((await params).handle);
  if (!handle.success) notFound();
  const tab = profileTabSchema.parse((await searchParams).tab);

  // Database functions return handles only, and films/stats only if you may see them.
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .rpc('get_profile', { target_handle: handle.data })
    .maybeSingle();
  if (error) throw error;
  if (!profile) notFound();

  const own = profile.relationship === 'self';
  const href = `/u/${profile.handle}`;

  return (
    <>
      <header className="flex flex-col gap-4 md:flex-row md:items-center">
        <Avatar
          name={profile.display_name}
          url={profile.avatar_url}
          size="lg"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="flex items-center gap-2 text-title-lg">
            <span className="truncate">{profile.display_name}</span>
            {profile.is_private && (
              <Lock
                size={16}
                role="img"
                aria-label="Private account"
                className="flex-none text-muted"
              />
            )}
          </h1>
          <p className="text-body-sm text-muted">@{profile.handle}</p>
          <p className="flex gap-4 text-body-sm text-muted">
            <span>
              <b className="text-ink">{profile.followers}</b>{' '}
              {profile.followers === 1 ? 'follower' : 'followers'}
            </span>
            <span>
              <b className="text-ink">{profile.following}</b> following
            </span>
          </p>
        </div>
        {own ? (
          <OwnActions />
        ) : (
          profile.visible && (
            <FollowButton
              handle={profile.handle}
              isPrivate={profile.is_private}
              initial={profile.relationship as Relationship}
            />
          )
        )}
      </header>

      {profile.visible ? (
        <>
          <ProfileStats
            watched={profile.watched_count}
            average={
              profile.average_rating === null
                ? null
                : Number(profile.average_rating)
            }
            distribution={profile.distribution}
          />
          <section className="flex flex-col gap-4">
            <Segmented
              label="Films"
              options={[
                {
                  label: `Watched ${profile.watched_count}`,
                  href,
                  active: tab === 'watched',
                },
                {
                  label: `Watchlist ${profile.watchlist_count}`,
                  href: `${href}?tab=watchlist`,
                  active: tab === 'watchlist',
                },
              ]}
            />
            <Films handle={profile.handle} tab={tab} own={own} />
          </section>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-line bg-surface px-6 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-full border border-line bg-raised text-muted">
            <Lock size={24} aria-hidden />
          </span>
          <h2 className="text-title">This account is private</h2>
          <p className="max-w-70 text-body-sm text-muted">
            Follow @{profile.handle} to see their films and ratings. They’ll
            need to approve your request.
          </p>
          <FollowButton
            handle={profile.handle}
            isPrivate
            initial={profile.relationship as Relationship}
          />
        </div>
      )}
    </>
  );
}

/**
 * Your own Requests (with how many are waiting) and Settings buttons.
 */
async function OwnActions() {
  // RLS returns only your own profile; its id stays on the server.
  const supabase = await createClient();
  const { data: me } = await supabase.from('profiles').select('id').single();
  const requests = me ? await getPendingRequestCount(me.id) : 0;
  return (
    <div className="flex flex-wrap gap-2">
      <ButtonLink href="/requests" icon={Inbox}>
        Requests
        {requests > 0 && (
          <span className="text-muted">{requests > 9 ? '9+' : requests}</span>
        )}
      </ButtonLink>
      <ButtonLink href="/settings" icon={Settings}>
        Settings
      </ButtonLink>
    </div>
  );
}

/**
 * The poster grid for the Watched or Watchlist tab, with their star ratings on
 * the Watched tab.
 */
async function Films({
  handle,
  tab,
  own,
}: {
  handle: string;
  tab: 'watched' | 'watchlist';
  own: boolean;
}) {
  const supabase = await createClient();
  const { data, error } =
    tab === 'watched'
      ? await supabase.rpc('get_member_watched', { target_handle: handle })
      : await supabase.rpc('get_member_watchlist', { target_handle: handle });
  if (error) throw error;

  if (data.length === 0) {
    return tab === 'watched' ? (
      <EmptyState
        icon={Eye}
        title={
          own
            ? 'You haven’t watched anything yet'
            : `@${handle} hasn’t watched anything yet`
        }
      />
    ) : (
      <EmptyState
        icon={Bookmark}
        title={
          own ? 'Your watchlist is empty' : `@${handle}’s watchlist is empty`
        }
      />
    );
  }

  return (
    <PosterGrid>
      {data.map((film) => (
        <PosterCard
          key={film.tmdb_id}
          title={film.title}
          year={film.release_year}
          posterUrl={posterUrl(film.poster_path)}
          href={`/movie/${film.tmdb_id}`}
          rating={'rating' in film ? (film.rating ?? undefined) : undefined}
        />
      ))}
    </PosterGrid>
  );
}
