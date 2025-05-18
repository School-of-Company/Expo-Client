import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (code) {
    const callbackUrl = new URL('/api/signin', request.nextUrl.origin);
    callbackUrl.searchParams.set('code', code);
    return NextResponse.redirect(callbackUrl);
  }

  const publicPaths = ['/signin', '/signup'];
  const pathname = request.nextUrl.pathname;

  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (!isPublicPath && !accessToken && !refreshToken) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  if (isPublicPath && accessToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/exhibition/:path*',
    '/form/:path*',
    '/name-tag/:path*',
    '/program/:path*',
    '/signin',
    '/signup',
    '/sms/:path*',
    '/',
  ],
};
