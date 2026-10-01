/**
 * Proxy: runs before every page request (Next 16's name for middleware).
 *
 * It does two jobs. It keeps your login fresh by renewing your session before
 * it expires, and it sends you to the sign-in page if you try to open the app
 * while signed out. Sign-in, the login callback and the API routes are left
 * alone: the API answers signed-out requests with a 401 itself.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const publicPaths = ['/sign-in', '/auth/', '/api/'];

/**
 * Refreshes your session, then redirects you to sign-in (or home) if you're on
 * the wrong side of the door.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirect = (path: string) => {
    const redirectResponse = NextResponse.redirect(new URL(path, request.url));
    response.cookies
      .getAll()
      .forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  };

  const { pathname } = request.nextUrl;
  if (!user && !publicPaths.some((path) => pathname.startsWith(path))) {
    return redirect('/sign-in');
  }
  if (user && pathname === '/sign-in') return redirect('/');
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
