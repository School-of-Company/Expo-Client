import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { deleteAuthCookies } from '@/shared/libs/cookie/deleteCookies';
import { serverInstance } from '@/shared/libs/http/serverInstance';

export async function DELETE() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  try {
    await serverInstance.delete('/auth', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const response = NextResponse.json({ success: true });
    return deleteAuthCookies(response);
  } catch (error) {
    if (error instanceof AxiosError) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || 'Logout failed';
      return NextResponse.json({ error: message }, { status });
    }
  }
}
