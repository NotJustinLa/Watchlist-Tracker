import { getReelBatch } from '@/lib/reels';
import { ReelDeck } from './ReelDeck';

export default async function ReelsPage() {
  return <ReelDeck initial={await getReelBatch(0)} />;
}
