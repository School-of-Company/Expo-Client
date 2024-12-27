import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/shared/libs/apiClient';

export async function POST(
  request: NextRequest,
  { params }: { params: { expo_id: string } },
) {
  const body = await request.json();
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const config = accessToken
    ? {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    : {};

  try {
    const response = await apiClient.post(
      `/sms/qr/${params.expo_id}`,
      body,
      config,
    );
    return NextResponse.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;

    const status = axiosError.response?.status;
    const message = axiosError.response?.data?.message;

    return NextResponse.json({ error: message }, { status });
  }
}
