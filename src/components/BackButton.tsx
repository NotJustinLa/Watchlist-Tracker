'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from './Button';

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
