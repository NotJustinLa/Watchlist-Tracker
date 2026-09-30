'use client';

import { ErrorState } from '@/components/ErrorState';

export default function Error({ retry }: { retry: () => void }) {
  return (
    <ErrorState
      onRetry={retry}
      title="Couldn’t load this film"
      body="The movie database didn’t respond. Check your connection and try again."
    />
  );
}
