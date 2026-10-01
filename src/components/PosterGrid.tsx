/**
 * The grid every list of posters uses.
 */

import { Children, type ReactNode } from 'react';

/**
 * Lays posters out in 3 columns on a phone, rising to 6 on a wide screen.
 */
export function PosterGrid({ children }: { children: ReactNode }) {
  return (
    <ul className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4 lg:grid-cols-5 lg:gap-x-5 lg:gap-y-6 xl:grid-cols-6">
      {Children.map(children, (child) => (
        <li className="min-w-0">{child}</li>
      ))}
    </ul>
  );
}
