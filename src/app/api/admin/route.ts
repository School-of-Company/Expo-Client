import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { apiClient } from '@/shared/libs/apiClient';

export async function GET() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  try {
    const response = await apiClient.get('/admin', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;

    const status = axiosError.response?.status || 500;
    const message =
      axiosError.response?.data?.message || 'request signup failed';

    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Access token not found' },
      { status: 401 },
    );
  }

  try {
    await apiClient.delete('/admin', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set('accessToken', '', { maxAge: 0 });
    response.cookies.set('refreshToken', '', { maxAge: 0 });
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      const status = error.response?.status || 500;
      const message =
        error.response?.data?.message || 'delete user account failed';
      return NextResponse.json({ error: message }, { status });
    }
  }
}
