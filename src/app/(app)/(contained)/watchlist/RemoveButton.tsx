'use client';

import { useState, useTransition } from 'react';
import { CircleAlert, X } from 'lucide-react';
import { Button } from '@/components/Button';
import { setOnWatchlist } from '@/app/(app)/movie/[id]/actions';

export function RemoveButton({
  tmdbId,
  title,
}: {
  tmdbId: number;
  title: string;
}) {
  const [removing, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function remove() {
    setFailed(false);
    startTransition(async () => {
      try {
        await setOnWatchlist(tmdbId, false);
      } catch {
        setFailed(true);
      }
    });
  }

  return (
    <div className="rounded-md bg-scrim backdrop-blur-sm">
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        icon={failed ? CircleAlert : X}
        loading={removing}
        onClick={remove}
        aria-label={
          failed
            ? `Couldn’t remove ${title}. Try again`
            : `Remove ${title} from watchlist`
        }
      />
    </div>
  );
}
