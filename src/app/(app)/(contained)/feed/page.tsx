import { UserPlus, Users } from 'lucide-react';
import { ButtonLink } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';

// Placeholder until the activity feed is built; points people to Discover.
export default function FeedPage() {
  return (
    <>
      <h1 className="text-title-lg">Activity</h1>
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
    </>
  );
}
