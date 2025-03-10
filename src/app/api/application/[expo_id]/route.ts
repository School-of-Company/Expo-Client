import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { apiClient } from '@/shared/libs/apiClient';

export async function POST(
  request: Request,
  { params }: { params: { expo_id: number } },
) {
  const body = await request.json();
  const { expo_id } = params;

  try {
    const response = await apiClient.post(`/application/${expo_id}`, body);
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;

    const status = axiosError.response?.status;
    const message = axiosError.response?.data?.message;

    return NextResponse.json({ error: message }, { status });
  }
}
