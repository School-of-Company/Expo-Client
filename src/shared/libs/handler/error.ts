import { AxiosError } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { deleteAuthCookies } from '../cookie/deleteCookies';
import { retryRequest } from './request';
import { createErrorResponse } from './response';
import { performTokenRefresh } from './token';

export async function handleError(
  error: unknown,
  req: NextRequest,
  isRetry: boolean,
  refreshToken?: string,
  originalBody?: string | FormData,
): Promise<NextResponse> {
  const axiosError = error as AxiosError<{ message: string }>;
  const status = axiosError.response?.status || 500;

  if (status === 401 && !isRetry && refreshToken) {
    const newTokens = await performTokenRefresh(refreshToken);
    if (newTokens) {
      return retryRequest(req, newTokens.accessToken, originalBody);
    } else {
      const res = createErrorResponse('토큰 갱신에 실패했습니다.', 401, true);
      return deleteAuthCookies(res);
    }
  }

  return createErrorResponse(
    axiosError.response?.data?.message || '요청 처리 중 오류가 발생했습니다.',
    status,
  );
}
