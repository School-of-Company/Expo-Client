import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { setAuthCookies } from '@/shared/libs/cookie/setAuthCookies';
import { serverInstance } from '@/shared/libs/http/serverInstance';
import { SignInData } from '@/shared/types/signin/type';

const INVALID_CREDENTIALS_MESSAGE = '닉네임 또는 비밀번호가 일치하지 않습니다.';

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
    return NextResponse.json(data);
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    const status = axiosError.response?.status || 500;

    // 없는 닉네임(404)도 틀린 비밀번호와 같은 응답으로 돌려 계정 존재를 드러내지 않는다.
    if (status === 404) {
      return NextResponse.json(
        { error: INVALID_CREDENTIALS_MESSAGE, status: 400 },
        { status: 400 },
      );
    }

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
