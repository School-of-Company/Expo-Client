import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { createErrorResponse } from './response';
import { toServerMessage } from './serverMessage';

// 파일 다운로드 요청은 arraybuffer 로 받으므로 오류 본문 { status, message } 를 직접 해석한다
const getErrorMessage = (status: number, data: unknown): string | undefined => {
  if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
    try {
      const text = new TextDecoder().decode(data);
      return getErrorMessage(status, JSON.parse(text));
    } catch {
      return toServerMessage(status, undefined);
    }
  }
  return toServerMessage(status, data);
};

export async function handleError(error: unknown): Promise<NextResponse> {
  const axiosError = error as AxiosError;
  const status = axiosError.response?.status || 500;

  return createErrorResponse(
    getErrorMessage(status, axiosError.response?.data) ||
      '요청 처리 중 오류가 발생했습니다.',
    status,
  );
}
