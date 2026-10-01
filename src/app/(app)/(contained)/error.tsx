'use client';

import { ErrorState } from '@/components/ErrorState';

// Shared by every standard page (search, lists, taste, social), so the copy stays general.
export default function Error({ retry }: { retry: () => void }) {
  return (
    <ErrorState
      onRetry={retry}
      title="This page didn’t load"
      body="Something went wrong on our side or with your connection. Try again."
    />
  );
}
