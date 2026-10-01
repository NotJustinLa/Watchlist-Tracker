/**
 * Feed page (`/feed`).
 *
 * What the people you follow have been up to: films they watched (with their
 * stars) and films they added to their watchlist, newest first. If you don't
 * follow anyone yet, you're pointed to Discover.
 */

import { UserPlus, Users } from 'lucide-react';
import { ButtonLink } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { FEED_PAGE_SIZE, getFeed } from '@/lib/feed';
import { FeedList } from './FeedList';

/**
 * Loads the first page of activity, or shows the empty state if there's none.
 */
export default async function FeedPage() {
  const events = await getFeed();

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-title-lg">Activity</h1>
        {events.length > 0 && (
          <ButtonLink href="/discover" size="sm" icon={UserPlus}>
            Find people
          </ButtonLink>
        )}
      </div>
      {events.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Follow people to see their activity"
          body="When people you follow watch or save films, it shows up here."
          action={
            <ButtonLink href="/discover" icon={UserPlus}>
              Discover people
            </ButtonLink>
          }
        />
      ) : (
        <FeedList initial={events} pageSize={FEED_PAGE_SIZE} />
      )}
    </>
  );
}
