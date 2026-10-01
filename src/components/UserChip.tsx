import Image from 'next/image';
import { Lock } from 'lucide-react';

type Person = {
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  /** Shows a lock after the name. */
  isPrivate?: boolean;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

/** Avatar, display name and @handle as one unit. */
export function UserChip({ person }: { person: Person }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden
        className="flex size-10 flex-none items-center justify-center overflow-hidden rounded-full bg-raised text-body-sm font-extrabold"
      >
        {person.avatarUrl ? (
          // Avatars come from each OAuth provider's CDN, so skip the optimizer's host allowlist.
          <Image
            src={person.avatarUrl}
            alt=""
            width={40}
            height={40}
            unoptimized
            className="size-full object-cover"
          />
        ) : (
          initials(person.displayName)
        )}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-label">{person.displayName}</span>
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
    </div>
  );
}
