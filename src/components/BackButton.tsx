/**
 * The back arrow on the movie page.
 */

'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from './Button';

/**
 * Takes you back where you came from, or to Search if you opened the film from
 * a link.
 */
export function BackButton() {
  const router = useRouter();
  return (
    <div className="rounded-md bg-scrim">
      <Button
        variant="ghost"
        icon={ChevronLeft}
        iconOnly
        aria-label="Back"
        onClick={() => (history.length > 1 ? router.back() : router.push('/'))}
      />
    </div>
  );
}
