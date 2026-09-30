import Image from 'next/image';
import Link from 'next/link';
import { Film } from 'lucide-react';

type PosterCardProps = {
  title: string;
  year: number | null;
  posterUrl: string | null;
  href: string;
};

export function PosterCard({ title, year, posterUrl, href }: PosterCardProps) {
  return (
    <Link
      href={href}
      className="group flex min-w-0 flex-col gap-2 focus-visible:outline-none"
    >
      <div className="relative aspect-2/3 overflow-hidden rounded-lg bg-raised transition group-hover:-translate-y-0.5 group-hover:shadow-poster group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-accent after:absolute after:inset-0 after:rounded-lg after:ring-1 after:ring-ink/5 after:ring-inset">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt=""
            fill
            sizes="(min-width: 1280px) 200px, (min-width: 1024px) 20vw, (min-width: 640px) 25vw, 33vw"
            className="object-cover"
          />
        ) : (
          <Film
            size={28}
            aria-hidden
            className="absolute inset-0 m-auto text-muted"
          />
        )}
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-body-sm font-bold">{title}</span>
        {year && <span className="text-caption text-muted">{year}</span>}
      </div>
    </Link>
  );
}
