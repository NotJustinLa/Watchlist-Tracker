/**
 * An on/off switch.
 */

'use client';

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  describedBy?: string;
};

/**
 * A toggle like the Private profile setting. When on it fills white, not
 * yellow, which is kept for highlights.
 */
export function Switch({ checked, onChange, label, describedBy }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-describedby={describedBy}
      onClick={() => onChange(!checked)}
      className="relative h-7 w-12 flex-none cursor-pointer rounded-full border border-line-strong bg-raised transition-colors aria-checked:border-ink aria-checked:bg-ink after:absolute after:top-0.75 after:left-0.75 after:size-5 after:rounded-full after:bg-muted after:transition-transform aria-checked:after:translate-x-5 aria-checked:after:bg-bg"
    />
  );
}
