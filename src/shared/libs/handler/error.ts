import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { createErrorResponse } from './response';

export async function handleError(error: unknown): Promise<NextResponse> {
  const axiosError = error as AxiosError<{ message: string }>;
  const status = axiosError.response?.status || 500;

  return createErrorResponse(
    axiosError.response?.data?.message || '요청 처리 중 오류가 발생했습니다.',
    status,
  );
}
