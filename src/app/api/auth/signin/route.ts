import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { apiClient } from '@/shared/libs/apiClient';
import { SignInData } from '@/shared/types/signin/type';

export async function POST(request: Request) {
  const body: SignInData = await request.json();

  try {
    const response = await apiClient.post('/auth/signin', body);

    const accessTokenExpires = new Date(response.data.accessTokenExpiresIn);
    const refreshTokenExpires = new Date(response.data.refreshTokenExpiresIn);

    cookies().set('accessToken', response.data.accessToken, {
      httpOnly: true,
      secure: true,
      expires: accessTokenExpires,
      sameSite: 'strict',
    });

    cookies().set('refreshToken', response.data.refreshToken, {
      httpOnly: true,
      secure: true,
      expires: refreshTokenExpires,
      sameSite: 'strict',
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
