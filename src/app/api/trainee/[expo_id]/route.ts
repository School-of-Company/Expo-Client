import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/shared/libs/apiClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { expo_id: number } },
) {
  const { expo_id } = params;
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const encodedName = request.nextUrl.searchParams.get('name');
  const name = encodedName ? decodeURIComponent(encodedName) : null;

  const config = accessToken
    ? {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: { name },
      }
    : {};

  try {
    const response = await apiClient.get(`/trainee/${expo_id}`, config);
    return NextResponse.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    const status = axiosError.response?.status || 500;
    const message = axiosError.response?.data?.message || 'expoDetail failed';
    return NextResponse.json({ error: message }, { status });
  }
}
