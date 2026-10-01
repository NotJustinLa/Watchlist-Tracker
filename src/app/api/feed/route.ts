import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireUserOr401 } from '@/lib/auth';
import { getFeed } from '@/lib/feed';

// GET /api/feed?before=<ISO time> -> { events }: the next page of the activity feed.
export async function GET(request: NextRequest) {
  const session = await requireUserOr401();
  if (session instanceof NextResponse) return session;

  const before = z.iso
    .datetime({ offset: true })
    .safeParse(request.nextUrl.searchParams.get('before'));
  if (!before.success) {
    return NextResponse.json({ error: 'Invalid cursor.' }, { status: 400 });
  }
  return NextResponse.json({ events: await getFeed(before.data) });
}
