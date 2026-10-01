/**
 * Handle check API (`GET /api/handles/check?h=name`).
 *
 * The Settings form calls this as you type, to tell you whether a handle is
 * free. It only ever answers yes or no, never who has it.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireUserOr401 } from '@/lib/auth';
import { handleSchema } from '@/lib/validation';

/**
 * Answers whether the handle is available, or 400 if it isn't a valid handle.
 */
export async function GET(request: NextRequest) {
  const session = await requireUserOr401();
  if (session instanceof NextResponse) return session;

  const handle = handleSchema.safeParse(request.nextUrl.searchParams.get('h'));
  if (!handle.success) {
    return NextResponse.json({ error: 'Invalid handle.' }, { status: 400 });
  }

  const { data, error } = await session.supabase.rpc('handle_available', {
    candidate: handle.data,
  });
  if (error) {
    return NextResponse.json({ error: 'Could not check.' }, { status: 500 });
  }
  return NextResponse.json({ available: data });
}
