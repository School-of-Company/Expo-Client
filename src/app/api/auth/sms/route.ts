import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { apiClient } from '@/shared/libs/apiClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phoneNumber = searchParams.get('phoneNumber');
  const code = searchParams.get('code');

  try {
    const response = await apiClient.get('/sms', {
      params: { phoneNumber, code },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Code verification failed' },
      { status: 400 },
    );
  }
}
export async function POST(request: Request) {
  const body = await request.json();

  try {
    const response = await apiClient.post('/sms', body);
    return NextResponse.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;

    const status = axiosError.response?.status || 500;
    const message = axiosError.response?.data?.message || 'sms failed';

    return NextResponse.json({ error: message }, { status });
  }
}
