import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import {
  parseExpiresAt,
  setAuthCookies,
} from '@/shared/libs/cookie/setAuthCookies';
import { clientIpHeaders } from '@/shared/libs/http/clientIp';
import { serverInstance } from '@/shared/libs/http/serverInstance';
import { SignInData } from '@/shared/types/signin/type';

export async function POST(request: Request) {
  const body: SignInData = await request.json();
  try {
    // 로그인 시도 제한이 사용자별로 걸리도록 클라이언트 IP 를 넘긴다(TRUSTED_PROXY_HOPS 설정 시)
    const { data } = await serverInstance.post('/auth/signin', body, {
      headers: clientIpHeaders(request),
    });

    setAuthCookies({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      accessTokenExpires: parseExpiresAt(data.accessTokenExpiresIn),
      refreshTokenExpires: parseExpiresAt(data.refreshTokenExpiresIn),
    });
    // 토큰은 httpOnly 쿠키로만 둔다. 브라우저 스크립트에 넘기지 않는다
    return NextResponse.json({ success: true });
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    const status = axiosError.response?.status || 500;

    const message =
      axiosError.response?.data?.message || '로그인에 실패했습니다.';
    const retryAfter = axiosError.response?.headers?.['retry-after'];
    return NextResponse.json(
      { error: message, status },
      {
        status,
        headers: retryAfter ? { 'Retry-After': String(retryAfter) } : undefined,
      },
    );
  }
}
