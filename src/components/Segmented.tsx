import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

type Option = {
  label: string;
  href: string;
  active: boolean;
  icon?: LucideIcon;
  /** Screen-reader label when the visible label is terse (e.g. "5" with a star). */
  ariaLabel?: string;
};

// URL-driven segmented control: each option is a link, the current one is marked.
export function Segmented({
  label,
  options,
}: {
  label: string;
  options: Option[];
}) {
  return (
    <nav
      aria-label={label}
      className="inline-flex flex-wrap gap-0.5 rounded-md border border-line bg-surface p-0.75"
    >
      {options.map(({ label, href, active, icon: Icon, ariaLabel }) => (
        <Link
          key={href}
          href={href}
          replace
          scroll={false}
          aria-label={ariaLabel}
          aria-current={active ? 'true' : undefined}
          className="flex h-8 items-center gap-1 rounded-[7px] px-3 text-body-sm font-bold text-muted transition-colors hover:text-ink aria-[current=true]:bg-raised aria-[current=true]:text-ink"
        >
          {Icon && (
            <Icon size={13} aria-hidden className="fill-accent text-accent" />
          )}
          {label}
        </Link>
      ))}
    </nav>
  );
}
