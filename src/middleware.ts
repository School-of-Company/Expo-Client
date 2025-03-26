import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken');
  const refreshToken = request.cookies.get('refreshToken');
  const url = request.nextUrl.pathname;

  if (
    url.startsWith('/signin') ||
    url.startsWith('/signUp') ||
    url.startsWith('/application/STANDARD') ||
    url.startsWith('/application/TRAINEE')
  ) {
    return NextResponse.next();
  }

  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/signin',
    '/signUp',
    '/admin',
    '/exhibition/create',
    '/exhibition/edit/:path*',
    '/expo-manage/:path*',
    '/name-tag/:path*',
    '/sms/:path*/STANDARD',
    '/sms/:path*/TRAINEE',
    '/program/:path*',
    '/program/detail/:path*',
    '/application/:path*/STANDARD',
    '/application/:path*/TRAINEE',
  ],
};
