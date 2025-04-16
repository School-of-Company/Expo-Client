import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { setAuthCookies } from '@/shared/libs/cookie/setAuthCookies';
import { serverInstance } from '@/shared/libs/http/serverInstance';
import { SignInData } from '@/shared/types/signin/type';

export async function POST(request: Request) {
  const body: SignInData = await request.json();

  try {
    const response = await serverInstance.post('/auth/signin', body);

    const accessTokenExpires = new Date(response.data.accessTokenExpiresIn);
    const refreshTokenExpires = new Date(response.data.refreshTokenExpiresIn);

    setAuthCookies({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      accessTokenExpires,
      refreshTokenExpires,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;

    const status = axiosError.response?.status || 500;
    const message =
      axiosError.response?.data?.message || '로그인에 실패했습니다.';

    return NextResponse.json({ error: message, status }, { status });
  }
}
