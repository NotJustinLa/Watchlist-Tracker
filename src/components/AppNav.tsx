'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Bookmark, Search, Sparkles, User } from 'lucide-react';

type NavId = 'search' | 'feed' | 'watchlist' | 'taste' | 'profile';

function activeTab(pathname: string): NavId {
  if (pathname.startsWith('/feed') || pathname.startsWith('/discover'))
    return 'feed';
  if (pathname.startsWith('/watchlist')) return 'watchlist';
  if (pathname.startsWith('/taste')) return 'taste';
  if (
    ['/u/', '/watched', '/requests', '/settings'].some((p) =>
      pathname.startsWith(p),
    )
  ) {
    return 'profile';
  }
  return 'search';
}

export function AppNav({ profileHref }: { profileHref: string }) {
  const active = activeTab(usePathname());
  const items = [
    { id: 'search', label: 'Search', href: '/', icon: Search },
    { id: 'feed', label: 'Feed', href: '/feed', icon: Activity },
    { id: 'watchlist', label: 'Watchlist', href: '/watchlist', icon: Bookmark },
    { id: 'taste', label: 'Taste', href: '/taste', icon: Sparkles },
    { id: 'profile', label: 'Profile', href: profileHref, icon: User },
  ] as const;

  const links = (itemClass: string, iconSize: number) =>
    items.map(({ id, label, href, icon: Icon }) => (
      <Link
        key={id}
        href={href}
        aria-current={id === active ? 'page' : undefined}
        className={`relative flex items-center transition-colors hover:text-ink aria-[current=page]:text-accent ${itemClass}`}
      >
        <Icon size={iconSize} aria-hidden />
        {label}
      </Link>
    ));

  return (
    <>
      <header className="sticky top-0 z-10 hidden h-16 items-center gap-8 border-b border-line bg-surface px-8 md:flex">
        <Link
          href="/"
          className="text-[22px] leading-none font-extrabold tracking-[-0.03em]"
        >
          Reel<span className="text-accent">.</span>
        </Link>
        <nav aria-label="Main" className="flex gap-1">
          {links('h-10 gap-2 rounded-md px-3 text-label text-muted', 20)}
        </nav>
      </header>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-10 flex h-[calc(4rem+env(safe-area-inset-bottom))] bg-surface pb-[env(safe-area-inset-bottom)] shadow-nav md:hidden"
      >
        {links(
          'min-w-11 flex-1 flex-col justify-center gap-0.75 text-[11px] leading-3.5 font-bold text-muted aria-[current=page]:before:absolute aria-[current=page]:before:inset-x-[28%] aria-[current=page]:before:top-0 aria-[current=page]:before:h-0.5 aria-[current=page]:before:rounded-b-xs aria-[current=page]:before:bg-accent',
          22,
        )}
      </nav>
    </>
  );
}
