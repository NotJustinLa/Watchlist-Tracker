import { Children, type ReactNode } from 'react';

export function PosterGrid({ children }: { children: ReactNode }) {
  return (
    <ul className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4 lg:grid-cols-5 lg:gap-x-5 lg:gap-y-6 xl:grid-cols-6">
      {Children.map(children, (child) => (
        <li className="min-w-0">{child}</li>
      ))}
    </ul>
  );
}
