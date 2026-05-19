import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/konto', '/admin'];
const ADMIN_PREFIX = '/admin';
const SESSION_COOKIES = ['authjs.session-token', '__Secure-authjs.session-token'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const hasSession = SESSION_COOKIES.some((name) => request.cookies.get(name));
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Rolle wird in Server-Komponenten via auth() validiert. Hier nur Cookie-Gate,
  // damit /admin nicht via Cookie-Bypass erreichbar ist.
  if (pathname.startsWith(ADMIN_PREFIX)) {
    // Wirkliche Role-Prüfung in app/admin/layout.tsx (Phase 3).
    return NextResponse.next();
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/konto/:path*', '/admin/:path*'],
};
