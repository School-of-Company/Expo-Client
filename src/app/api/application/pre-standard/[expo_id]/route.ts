import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { apiClient } from '@/shared/libs/apiClient';

export async function POST(
  request: Request,
  { params }: { params: { expo_id: number } },
) {
  const body = await request.json();
  const { expo_id } = params;

  console.log('🍒' + JSON.stringify(body, null, 2));

  try {
    const response = await apiClient.post(
      `/application/pre-standard/${expo_id}`,
      body,
    );
    console.log('🐶' + response.status);
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('🚨 Error:', error);
    const axiosError = error as AxiosError<{ message: string }>;

    const status = axiosError.response?.status;
    const message = axiosError.response?.data?.message;

    return NextResponse.json({ error: message }, { status });
  }
}
