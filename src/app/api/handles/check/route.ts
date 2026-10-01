import { NextResponse, type NextRequest } from 'next/server';
import { requireUserOr401 } from '@/lib/auth';
import { handleSchema } from '@/lib/validation';

// GET /api/handles/check?h=name -> { available: boolean }. Never returns who owns a handle.
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
