import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { setAuthCookies } from '@/shared/libs/cookie/setAuthCookies';
import { serverInstance } from '@/shared/libs/http/serverInstance';
import { SignInData } from '@/shared/types/signin/type';

export async function POST(request: Request) {
  const body: SignInData = await request.json();
  try {
    const { data } = await serverInstance.post('/auth/signin', body);

    const accessTokenExpires = new Date(data.accessTokenExpiresIn + 'Z');
    const refreshTokenExpires = new Date(data.refreshTokenExpiresIn + 'Z');

    setAuthCookies({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      accessTokenExpires,
      refreshTokenExpires,
    });
    // 토큰은 httpOnly 쿠키로만 둔다. 브라우저 스크립트에 넘기지 않는다
    return NextResponse.json({ success: true });
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    const status = axiosError.response?.status || 500;
    const message =
      axiosError.response?.data?.message || '로그인에 실패했습니다.';
    return NextResponse.json({ error: message, status }, { status });
  }
}
