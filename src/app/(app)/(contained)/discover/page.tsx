import { Suspense } from 'react';
import { SearchX, Users } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { FollowButton, type Relationship } from '@/components/FollowButton';
import { SearchInput } from '@/components/SearchInput';
import { Skeleton } from '@/components/Skeleton';
import { UserChip } from '@/components/UserChip';
import { createClient } from '@/lib/supabase/server';
import { memberQuerySchema } from '@/lib/validation';

export default async function DiscoverPage({
  searchParams,
}: PageProps<'/discover'>) {
  const query = memberQuerySchema.parse((await searchParams).q);

  return (
    <>
      <div className="flex flex-col gap-3">
        <h1 className="text-title-lg">Discover people</h1>
        <SearchInput
          defaultValue={query}
          path="/discover"
          placeholder="Search by name or @handle"
        />
      </div>
      <Suspense key={query} fallback={<MemberSkeletons />}>
        <Members query={query} />
      </Suspense>
    </>
  );
}

async function Members({ query }: { query: string }) {
  if (!query) {
    return (
      <EmptyState
        icon={Users}
        title="Find people you know"
        body="Search by display name or @handle, then follow them to see what they watch."
      />
    );
  }

  // A database function returns public profile fields and your relationship to each. No ids.
  const supabase = await createClient();
  const { data: members, error } = await supabase.rpc('search_members', {
    query,
  });
  if (error) throw error;

  if (members.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title={`No members match “${query}”`}
        body="Handles are exact: try their display name instead."
      />
    );
  }

  return (
    <section className="flex max-w-2xl flex-col gap-1">
      <h2 className="text-overline text-muted uppercase">
        {members.length} {members.length === 1 ? 'member' : 'members'}
      </h2>
      <ul>
        {members.map((member) => (
          <li
            key={member.handle}
            className="flex items-center gap-3 border-b border-line py-3 last:border-b-0"
          >
            <div className="min-w-0 flex-1">
              <UserChip
                person={{
                  handle: member.handle,
                  displayName: member.display_name,
                  avatarUrl: member.avatar_url,
                  isPrivate: member.is_private,
                }}
              />
            </div>
            {member.relationship === 'self' ? (
              <span className="text-body-sm text-muted">You</span>
            ) : (
              <FollowButton
                handle={member.handle}
                isPrivate={member.is_private}
                initial={member.relationship as Relationship}
              />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function MemberSkeletons() {
  return (
    <div
      role="status"
      aria-label="Searching members"
      className="flex max-w-2xl flex-col gap-4"
    >
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton rounded="full" className="size-10" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton rounded="md" className="h-9 w-24" />
        </div>
      ))}
    </div>
  );
}
