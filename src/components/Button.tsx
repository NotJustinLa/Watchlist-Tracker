import type { ComponentProps } from 'react';
import Link from 'next/link';
import { LoaderCircle, type LucideIcon } from 'lucide-react';

type Look = {
  variant?: 'default' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconOnly?: boolean;
};

const variants = {
  default: 'border-line bg-surface',
  ghost: 'border-transparent bg-transparent',
  on: 'border-line bg-raised',
};

const sizes = {
  sm: 'h-9 text-body-sm font-bold',
  md: 'h-11 text-label',
  lg: 'h-13 text-label',
};

const padding = { sm: 'px-3', md: 'px-4', lg: 'px-4' };

function classes(
  { variant = 'default', size = 'md', iconOnly = false }: Look,
  on: boolean | undefined,
  className: string,
) {
  return `inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border whitespace-nowrap text-ink transition-colors hover:border-accent hover:bg-accent hover:text-on-accent focus-visible:border-accent focus-visible:bg-accent focus-visible:text-on-accent active:border-accent active:bg-accent active:text-on-accent disabled:pointer-events-none disabled:opacity-45 ${variants[on ? 'on' : variant]} ${sizes[size]} ${iconOnly ? 'aspect-square' : padding[size]} ${className}`;
}

type ButtonProps = ComponentProps<'button'> &
  Look & {
    /** Toggled state (e.g. "On watchlist"): raised fill, announced via aria-pressed. */
    on?: boolean;
    loading?: boolean;
  };

export function Button({
  variant,
  size,
  icon: Icon,
  iconOnly,
  on,
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const LeadIcon = loading ? LoaderCircle : Icon;
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-pressed={on}
      className={classes({ variant, size, iconOnly }, on, className)}
      {...props}
    >
      {LeadIcon && (
        <LeadIcon
          size={18}
          aria-hidden
          className={loading ? 'motion-safe:animate-spin' : undefined}
        />
      )}
      {children}
    </button>
  );
}

/** A link that looks like a Button, for actions that navigate. */
export function ButtonLink({
  variant,
  size,
  icon: Icon,
  iconOnly,
  className = '',
  children,
  ...props
}: ComponentProps<typeof Link> & Look) {
  return (
    <Link
      className={classes({ variant, size, iconOnly }, false, className)}
      {...props}
    >
      {Icon && <Icon size={18} aria-hidden />}
      {children}
    </Link>
  );
}
