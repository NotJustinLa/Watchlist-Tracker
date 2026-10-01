import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireUserOr401 } from '@/lib/auth';
import { getReelBatch, REEL_PAGES } from '@/lib/reels';

const pageSchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(REEL_PAGES - 1);

// GET /api/reels?page=n -> { items }: the next batch of the Reels feed.
export async function GET(request: NextRequest) {
  const session = await requireUserOr401();
  if (session instanceof NextResponse) return session;

  const page = pageSchema.safeParse(request.nextUrl.searchParams.get('page'));
  if (!page.success) {
    return NextResponse.json({ error: 'Invalid page.' }, { status: 400 });
  }

  try {
    return NextResponse.json({ items: await getReelBatch(page.data) });
  } catch {
    return NextResponse.json(
      { error: 'Couldn’t load films.' },
      { status: 502 },
    );
  }
}
