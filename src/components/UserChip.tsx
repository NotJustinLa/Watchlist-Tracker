import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Avatar } from './Avatar';

type Person = {
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  /** Shows a lock after the name. */
  isPrivate?: boolean;
};

/** Avatar, display name and @handle as one unit, linking to the member's profile. */
export function UserChip({ person }: { person: Person }) {
  return (
    <Link
      href={`/u/${person.handle}`}
      className="group flex min-w-0 items-center gap-3"
    >
      <Avatar name={person.displayName} url={person.avatarUrl} />
      <span className="flex min-w-0 flex-col">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-label group-hover:underline">
            {person.displayName}
          </span>
          {person.isPrivate && (
            <Lock
              size={13}
              role="img"
              aria-label="Private account"
              className="flex-none text-muted"
            />
          )}
        </span>
        <span className="truncate text-body-sm text-muted">
          @{person.handle}
        </span>
      </span>
    </Link>
  );
}
