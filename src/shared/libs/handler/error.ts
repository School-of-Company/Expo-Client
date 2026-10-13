import axios, { AxiosError } from 'axios';
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

const TIMEOUT_CODES = ['ECONNABORTED', 'ETIMEDOUT'];

/**
 * Gateway 응답 자체를 받지 못한 경우를 상태로 바꾼다. 응답이 있거나 axios 오류가 아니면 null.
 * 기다리다 끊기면 504, 연결하지 못하면 502 로 돌려 서버 오류(500)와 구분한다.
 * 핸들러 안의 코드 오류까지 502 로 바꾸면 게이트웨이 장애로 보이므로 axios 오류만 본다
 */
export const toUpstreamFailure = (
  error: unknown,
): { status: number; message: string } | null => {
  if (!axios.isAxiosError(error) || error.response) return null;
  return TIMEOUT_CODES.includes(error.code ?? '')
    ? {
        status: 504,
        message:
          '서버 응답이 늦어 요청을 마치지 못했습니다. 잠시 후 다시 시도해 주세요.',
      }
    : {
        status: 502,
        message: '서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.',
      };
};

export async function handleError(error: unknown): Promise<NextResponse> {
  const upstream = toUpstreamFailure(error);
  if (upstream) return createErrorResponse(upstream.message, upstream.status);

  const axiosError = error as AxiosError;
  const status = axiosError.response?.status || 500;

  return createErrorResponse(
    getErrorMessage(status, axiosError.response?.data) ||
      '요청 처리 중 오류가 발생했습니다.',
    status,
  );
}
