import axios from 'axios';
import { toServerMessage } from '@/shared/libs/handler/serverMessage';

/** 서버 응답 상태와 오류 코드를 보존하는 오류. 재시도·화면 분기에서 상태나 코드로 판단할 수 있다 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 서버가 응답한 axios 오류를 ApiError 로 바꾼다. 프록시는 { error }, 서비스는 { message },
 * ProblemDetail 은 { detail } 로 문구를 주므로 모두 읽고, 영문뿐이면 상태별 한국어 문구를 쓴다.
 * 응답이 없는 네트워크 오류는 그대로 돌려준다.
 */
export const toApiError = (error: unknown, fallback: string): unknown => {
  if (!axios.isAxiosError(error) || !error.response) return error;
  const { status, data } = error.response;
  return new ApiError(toServerMessage(status, data) ?? fallback, status);
};

export const getErrorStatus = (error: unknown): number | undefined => {
  if (error instanceof ApiError) return error.status;
  if (axios.isAxiosError(error)) return error.response?.status;
  return undefined;
};
