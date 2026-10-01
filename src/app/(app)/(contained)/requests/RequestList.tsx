'use client';

import { useState, useTransition } from 'react';
import { Check, CircleAlert, Inbox } from 'lucide-react';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { UserChip } from '@/components/UserChip';
import { respondToRequest } from '@/app/(app)/follow-actions';

type Person = { handle: string; displayName: string; avatarUrl: string | null };

/**
 * Keeps the rows it was first given: after Approve/Decline the page refreshes
 * (for the badge count), but answered rows stay with a note until you leave.
 */
export function RequestList({ requests }: { requests: Person[] }) {
  const [rows] = useState(requests);
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No requests right now"
        body="When someone asks to follow your private profile, they’ll appear here."
      />
    );
  }
  return (
    <ul className="max-w-2xl">
      {rows.map((person) => (
        <RequestRow key={person.handle} person={person} />
      ))}
    </ul>
  );
}

function RequestRow({ person }: { person: Person }) {
  const [pending, startTransition] = useTransition();
  const [outcome, setOutcome] = useState<'approved' | 'declined' | 'failed'>();

  function respond(approve: boolean) {
    setOutcome(undefined);
    startTransition(async () => {
      try {
        const result = await respondToRequest(person.handle, approve);
        setOutcome(result ? 'failed' : approve ? 'approved' : 'declined');
      } catch {
        setOutcome('failed');
      }
    });
  }

  return (
    <li className="flex items-center gap-3 border-b border-line py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <UserChip person={person} />
      </div>
      {outcome === 'approved' || outcome === 'declined' ? (
        <p
          role="status"
          className="flex items-center gap-1.5 text-body-sm text-muted"
        >
          {outcome === 'approved' && <Check size={14} aria-hidden />}
          {outcome === 'approved' ? 'Approved' : 'Declined'}
        </p>
      ) : (
        <div className="flex flex-none items-center gap-2">
          {outcome === 'failed' && (
            <CircleAlert
              size={16}
              role="img"
              aria-label="Couldn’t save. Try again."
              className="text-negative"
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => respond(false)}
          >
            Decline
          </Button>
          <Button size="sm" loading={pending} onClick={() => respond(true)}>
            Approve
          </Button>
        </div>
      )}
    </li>
  );
}
