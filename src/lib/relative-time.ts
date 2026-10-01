const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "Just now", "5m ago", "2h ago", "Yesterday", "3d ago", then "Mar 2024". */
export function relativeTime(iso: string, now = Date.now()) {
  const ago = now - Date.parse(iso);
  if (ago < MINUTE) return 'Just now';
  if (ago < HOUR) return `${Math.floor(ago / MINUTE)}m ago`;
  if (ago < DAY) return `${Math.floor(ago / HOUR)}h ago`;
  if (ago < 2 * DAY) return 'Yesterday';
  if (ago < 7 * DAY) return `${Math.floor(ago / DAY)}d ago`;
  return new Date(iso).toLocaleDateString('en', {
    month: 'short',
    year: 'numeric',
  });
}
