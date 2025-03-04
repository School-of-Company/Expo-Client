import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { apiClient } from '@/shared/libs/apiClient';

export async function POST(
  request: Request,
  { params }: { params: { trainingPro_id: number } },
) {
  const body = await request.json();
  const { trainingPro_id } = params;
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
      `/training/application/${trainingPro_id}`,
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
