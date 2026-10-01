/**
 * The grid every list of posters uses.
 */

'use client';

import { Children, type ReactNode } from 'react';
import { MotionConfig, motion } from 'motion/react';
import { EASE_OUT, ENTER_DURATION } from '@/lib/motion';

/**
 * Lays posters out in 3 columns on a phone, rising to 6 on a wide screen.
 *
 * Posters rise in one after another when the grid first appears. When you sort
 * the list or remove a film, the others slide to their new places instead of
 * jumping. Both calm down if you've asked your device for less motion.
 */
export function PosterGrid({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ul className="stagger grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4 lg:grid-cols-5 lg:gap-x-5 lg:gap-y-6 xl:grid-cols-6">
        {Children.map(children, (child) => (
          <motion.li
            layout
            transition={{
              layout: { duration: ENTER_DURATION, ease: EASE_OUT },
            }}
            className="min-w-0"
          >
            {child}
          </motion.li>
        ))}
      </ul>
    </MotionConfig>
  );
}
