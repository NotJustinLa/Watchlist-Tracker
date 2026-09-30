import type { ComponentProps } from 'react';
import { LoaderCircle, type LucideIcon } from 'lucide-react';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'default' | 'ghost';
  size?: 'md' | 'sm';
  icon?: LucideIcon;
  loading?: boolean;
};

const variants = {
  default: 'border-line bg-surface',
  ghost: 'border-transparent bg-transparent',
};

const sizes = {
  md: 'h-11 px-4 text-label',
  sm: 'h-9 px-3 text-body-sm font-bold',
};

export function Button({
  variant = 'default',
  size = 'md',
  icon: Icon,
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
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border whitespace-nowrap text-ink transition-colors hover:border-accent hover:bg-accent hover:text-on-accent focus-visible:border-accent focus-visible:bg-accent focus-visible:text-on-accent active:border-accent active:bg-accent active:text-on-accent disabled:pointer-events-none disabled:opacity-45 ${variants[variant]} ${sizes[size]} ${className}`}
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
