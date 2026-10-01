import Image from 'next/image';

const sizes = { md: 40, lg: 88 };

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

/** A round photo, or initials on the raised surface. Decorative: names are shown beside it. */
export function Avatar({
  name,
  url,
  size = 'md',
}: {
  name: string;
  url: string | null;
  size?: keyof typeof sizes;
}) {
  const px = sizes[size];
  return (
    <span
      aria-hidden
      style={{ width: px, height: px, fontSize: Math.round(px * 0.36) }}
      className="flex flex-none items-center justify-center overflow-hidden rounded-full bg-raised font-extrabold"
    >
      {url ? (
        // Avatars come from each OAuth provider's CDN, so skip the optimizer's host allowlist.
        <Image
          src={url}
          alt=""
          width={px}
          height={px}
          unoptimized
          className="size-full object-cover"
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}
