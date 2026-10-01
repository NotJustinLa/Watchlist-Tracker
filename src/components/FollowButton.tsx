'use client';

import { useState, useTransition } from 'react';
import { Check, CircleAlert, Clock, UserPlus } from 'lucide-react';
import { follow, unfollow } from '@/app/(app)/follow-actions';
import { Button } from './Button';

export type Relationship = 'none' | 'requested' | 'following';

type FollowButtonProps = {
  handle: string;
  isPrivate: boolean;
  initial: Relationship;
};

/**
 * Follow / Request to follow → Following / Requested; tap again to undo.
 * Unfollowing a private account asks to confirm, since re-following needs approval.
 */
export function FollowButton({
  handle,
  isPrivate,
  initial,
}: FollowButtonProps) {
  const [state, setState] = useState(initial);
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  // Shows the expected state at once, then settles on what the server says.
  function run(optimistic: Relationship, action: () => Promise<Relationship>) {
    const previous = state;
    setState(optimistic);
    setConfirming(false);
    setFailed(false);
    startTransition(async () => {
      try {
        setState(await action());
      } catch {
        setState(previous);
        setFailed(true);
      }
    });
  }

  function onClick() {
    if (state === 'none') {
      run(isPrivate ? 'requested' : 'following', async () =>
        (await follow(handle)) === 'pending' ? 'requested' : 'following',
      );
    } else if (state === 'following' && isPrivate && !confirming) {
      setConfirming(true);
    } else {
      run('none', async () => {
        await unfollow(handle);
        return 'none';
      });
    }
  }

  const look = {
    none: { label: isPrivate ? 'Request to follow' : 'Follow', icon: UserPlus },
    following: { label: confirming ? 'Unfollow?' : 'Following', icon: Check },
    requested: { label: 'Requested', icon: Clock },
  }[state];

  return (
    <div className="flex flex-none items-center gap-2">
      {failed && (
        <CircleAlert
          size={16}
          role="img"
          aria-label="Couldn’t update. Try again."
          className="text-negative"
        />
      )}
      {confirming && (
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      )}
      <Button
        size="sm"
        icon={look.icon}
        on={state !== 'none' && !confirming}
        disabled={pending}
        onClick={onClick}
      >
        {look.label}
      </Button>
    </div>
  );
}
