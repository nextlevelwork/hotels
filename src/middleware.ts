import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Protect /profile/* — redirect to login if not authenticated
  if (pathname.startsWith('/profile') && !isLoggedIn) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect /admin/* — require admin role
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (req.auth?.user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Redirect away from /auth/* if already logged in
  if (pathname.startsWith('/auth') && isLoggedIn) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/profile/:path*', '/auth/:path*', '/admin/:path*'],
};
