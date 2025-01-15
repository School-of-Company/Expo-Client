import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MANAGE_RESTRICTED_PATHS = [
  /^\/signIn$/,
  /^\/signUp$/,
  /^\/application\/.+\/(STANDARD|TRAINEE)$/,
];

const USER_RESTRICTED_PATHS = [
  /^\/admin$/,
  /^\/create-exhibition$/,
  /^\/expo-manage\/.+$/,
  /^\/name-tag\/.+$/,
  /^\/sms\/.+\/(STANDARD|TRAINEE)$/,
  /^\/program(\/.*)?$/,
];

function handleApiRole(request: NextRequest): NextResponse {
  const requestHeaders = new Headers(request.headers);
  const role = request.cookies.get('accessToken') ? 'manage' : 'user';
  requestHeaders.set('role', role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

function isPathMatch(pathname: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(pathname));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/api/role') {
    return handleApiRole(request);
  }

  const accessToken = request.cookies.get('accessToken');

  if (!accessToken && isPathMatch(pathname, USER_RESTRICTED_PATHS)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (accessToken && isPathMatch(pathname, MANAGE_RESTRICTED_PATHS)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/role',
    '/signIn',
    '/signUp',
    '/admin',
    '/create-exhibition',
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
