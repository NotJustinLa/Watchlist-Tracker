import type { ComponentProps } from 'react';
import { LoaderCircle, type LucideIcon } from 'lucide-react';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'default' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconOnly?: boolean;
  /** Toggled state (e.g. "On watchlist"): raised fill, announced via aria-pressed. */
  on?: boolean;
  loading?: boolean;
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

export function Button({
  variant = 'default',
  size = 'md',
  icon: Icon,
  iconOnly = false,
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
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border whitespace-nowrap text-ink transition-colors hover:border-accent hover:bg-accent hover:text-on-accent focus-visible:border-accent focus-visible:bg-accent focus-visible:text-on-accent active:border-accent active:bg-accent active:text-on-accent disabled:pointer-events-none disabled:opacity-45 ${variants[on ? 'on' : variant]} ${sizes[size]} ${iconOnly ? 'aspect-square' : padding[size]} ${className}`}
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
