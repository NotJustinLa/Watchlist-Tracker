/**
 * Reels page (`/reels`).
 *
 * A Hinge-style deck of recommended films, one card at a time. Swipe right to
 * add a film to your watchlist, left to skip it.
 */

import { getReelBatch } from '@/lib/reels';
import { ReelDeck } from './ReelDeck';

/**
 * Loads the first batch of films and hands them to the swipe deck.
 */
export default async function ReelsPage() {
  return <ReelDeck initial={await getReelBatch(0)} />;
}
