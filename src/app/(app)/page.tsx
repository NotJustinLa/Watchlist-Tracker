import { PosterCard } from '@/components/PosterCard';
import { PosterGrid } from '@/components/PosterGrid';

const placeholderFilms = [
  { id: 1, title: 'Past Lives', year: 2023 },
  { id: 2, title: 'Perfect Days', year: 2023 },
  { id: 3, title: 'Aftersun', year: 2022 },
  { id: 4, title: 'Portrait of a Lady on Fire', year: 2019 },
  { id: 5, title: 'Parasite', year: 2019 },
  { id: 6, title: 'In the Mood for Love', year: 2000 },
  { id: 7, title: 'Spirited Away', year: 2001 },
  { id: 8, title: 'The Zone of Interest', year: 2023 },
  { id: 9, title: 'Anatomy of a Fall', year: 2023 },
  { id: 10, title: 'Drive My Car', year: 2021 },
  { id: 11, title: 'Everything Everywhere All at Once', year: 2022 },
  { id: 12, title: 'Moonlight', year: 2016 },
];

export default function SearchPage() {
  return (
    <section className="flex flex-col gap-3">
      <h1 className="text-title">Popular right now</h1>
      <PosterGrid>
        {placeholderFilms.map((film) => (
          <PosterCard
            key={film.id}
            title={film.title}
            year={film.year}
            posterUrl={null}
            href={`/movie/${film.id}`}
          />
        ))}
      </PosterGrid>
    </section>
  );
}
