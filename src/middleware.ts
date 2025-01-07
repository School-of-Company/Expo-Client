import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken');

  const requestHeaders = new Headers(request.headers);

  if (accessToken) {
    requestHeaders.set('role', 'manage');
  } else {
    requestHeaders.set('role', 'user');
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/api/role'],
};
