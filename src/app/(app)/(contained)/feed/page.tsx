import { UserPlus, Users } from 'lucide-react';
import { ButtonLink } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { FEED_PAGE_SIZE, getFeed } from '@/lib/feed';
import { FeedList } from './FeedList';

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
