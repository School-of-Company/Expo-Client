import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { apiClient } from '@/shared/libs/apiClient';

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
