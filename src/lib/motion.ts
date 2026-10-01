/**
 * Motion values for code that animates with the Motion library.
 *
 * They match the design system's easing and duration tokens (and the CSS ones
 * in globals.css), so JavaScript and CSS animations move the same way.
 */

/** Anything entering or moving: a quick start and a long, soft landing. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Anything leaving, like a card flying off the Reels deck. */
export const EASE_IN = [0.55, 0, 1, 0.45] as const;

/** How long things take to arrive, in seconds. */
export const ENTER_DURATION = 0.42;
