/**
 * The search box used on Search and Discover.
 */

'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Button } from './Button';

type SearchInputProps = {
  defaultValue: string;
  /** Page whose `?q=` this input drives. */
  path?: string;
  placeholder?: string;
};

/**
 * Puts what you type into the address bar a moment after you stop typing, so
 * the page can show results.
 */
export function SearchInput({
  defaultValue,
  path = '/',
  placeholder = 'Search films by title',
}: SearchInputProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function update(next: string, delay = 300) {
    setValue(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const q = next.trim();
      router.replace(q ? `${path}?q=${encodeURIComponent(q)}` : path, {
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
        placeholder={placeholder}
        aria-label={placeholder}
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
