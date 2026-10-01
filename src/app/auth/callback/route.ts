import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = z.string().min(1).max(512).safeParse(searchParams.get('code'));

  if (code.success) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code.data);
    if (!error) return NextResponse.redirect(`${origin}/`);
  }
  return NextResponse.redirect(`${origin}/sign-in?error=auth`);
}
