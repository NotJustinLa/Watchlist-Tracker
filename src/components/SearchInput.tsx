'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Button } from './Button';

export function SearchInput({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function update(next: string, delay = 300) {
    setValue(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const q = next.trim();
      router.replace(q ? `/?q=${encodeURIComponent(q)}` : '/', {
        scroll: false,
      });
    }, delay);
  }

  return (
    <div role="search" className="relative flex items-center">
      <Search
        size={18}
        aria-hidden
        className="pointer-events-none absolute left-3 text-muted"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => update(e.target.value)}
        placeholder="Search films by title"
        aria-label="Search films by title"
        maxLength={100}
        className="h-11 w-full rounded-md border border-line-strong bg-raised pr-12 pl-10 text-body transition-colors placeholder:text-muted focus-visible:border-accent focus-visible:outline-offset-1 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          icon={X}
          iconOnly
          aria-label="Clear search"
          onClick={() => update('', 0)}
          className="absolute right-1"
        />
      )}
    </div>
  );
}
