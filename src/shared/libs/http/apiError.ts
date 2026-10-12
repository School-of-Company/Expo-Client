import axios from 'axios';

/** 서버 응답 상태를 보존하는 오류. 재시도·화면 분기에서 상태로 판단할 수 있다 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 서버가 응답한 axios 오류를 ApiError 로 바꾼다. 프록시는 { error }, 서비스는 { message } 로
 * 문구를 주므로 둘 다 읽는다. 응답이 없는 네트워크 오류는 그대로 돌려준다.
 */
export const toApiError = (error: unknown, fallback: string): unknown => {
  if (!axios.isAxiosError(error) || !error.response) return error;
  const { status, data } = error.response;
  const message = data?.error || data?.message;
  return new ApiError(
    typeof message === 'string' && message ? message : fallback,
    status,
  );
};

export const getErrorStatus = (error: unknown): number | undefined => {
  if (error instanceof ApiError) return error.status;
  if (axios.isAxiosError(error)) return error.response?.status;
  return undefined;
};
