import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { apiClient } from '@/shared/libs/apiClient';

interface SigninRequestBody {
  nickname: string;
  password: string;
}

export async function POST(request: Request) {
  const body: SigninRequestBody = await request.json();

  try {
    const response = await apiClient.post('/auth/signin', body);
    return NextResponse.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    const status = axiosError.response?.status || 500;
    const message = axiosError.response?.data?.message || 'Signin failed';

    return NextResponse.json({ error: message }, { status });
  }
}
