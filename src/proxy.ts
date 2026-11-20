import { jwtVerify } from 'jose';
import { NextResponse, type NextRequest } from 'next/server';

const COOKIE_NAME = process.env.COOKIE_NAME ?? 'dt_session';
const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? '');

const PUBLIC_PATHS = ['/login'];

async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token || secret.length === 0) return false;
  try {
    await jwtVerify(token, secret, { algorithms: ['HS256'] });
    return true;
  } catch {
    return false;
  }
}

/**
 * Route protection (Next.js 16 "proxy", formerly middleware). Verifies the session cookie's
 * signature and expiry before any page renders. The API still checks every request itself —
 * this layer is about UX (no flash of protected pages) and defence in depth.
 */
export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const authed = await isValidSession(req.cookies.get(COOKIE_NAME)?.value);
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!authed && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = pathname === '/' ? '' : `?next=${encodeURIComponent(pathname + search)}`;
    const res = NextResponse.redirect(url);
    // Drop an expired/invalid cookie so the browser stops sending it.
    if (req.cookies.has(COOKIE_NAME)) res.cookies.delete(COOKIE_NAME);
    return res;
  }

  if (authed && (isPublic || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Everything except the API proxy, Next internals and static files.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:png|jpg|svg|webp|ico)$).*)',
  ],
};
