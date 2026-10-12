import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { createErrorResponse } from './response';

// 파일 다운로드 요청은 arraybuffer 로 받으므로 오류 본문 { status, message } 를 직접 해석한다
const getErrorMessage = (data: unknown): string | undefined => {
  if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
    try {
      const text = new TextDecoder().decode(data);
      return getErrorMessage(JSON.parse(text));
    } catch {
      return undefined;
    }
  }
  const message = (data as { message?: unknown } | undefined)?.message;
  return typeof message === 'string' ? message : undefined;
};

export async function handleError(error: unknown): Promise<NextResponse> {
  const axiosError = error as AxiosError;
  const status = axiosError.response?.status || 500;

  return createErrorResponse(
    getErrorMessage(axiosError.response?.data) ||
      '요청 처리 중 오류가 발생했습니다.',
    status,
  );
}
