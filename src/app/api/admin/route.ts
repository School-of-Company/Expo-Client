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

export async function PATCH(request: Request) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const url = new URL(request.url);
  const adminId = url.pathname.split('/').pop();

  if (!adminId) {
    return NextResponse.json(
      { error: 'admin_id is required' },
      { status: 400 },
    );
  }

  try {
    const response = await apiClient.patch(`/admin/${adminId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;

    const status = axiosError.response?.status || 500;
    const message = axiosError.response?.data?.message || 'admin failed';

    return NextResponse.json({ error: message }, { status });
  }
}
