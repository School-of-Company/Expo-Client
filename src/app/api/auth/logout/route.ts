import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { apiClient } from '@/shared/libs/apiClient';

export async function DELETE() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  try {
    await apiClient.delete('/auth', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const response = NextResponse.json({ success: true });
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || 'Logout failed';
      return NextResponse.json({ error: message }, { status });
    }
  }
}
