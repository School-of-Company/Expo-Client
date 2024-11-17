import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { apiClient } from '@/shared/libs/apiClient';

export async function GET(
  request: Request,
  { params }: { params: { expo_id: number } },
) {
  const { expo_id } = params;
  try {
    const response = await apiClient.get(`/expo/${expo_id}`);
    return NextResponse.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    const status = axiosError.response?.status || 500;
    const message = axiosError.response?.data?.message || 'expoDetail failed';
    return NextResponse.json({ error: message }, { status });
  }
}
