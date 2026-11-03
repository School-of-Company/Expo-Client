import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

// 응답이 오지 않는 요청 하나가 줄 전체를 막지 않도록 끊는 시간
const REQUEST_TIMEOUT_MS = 15_000;

let tail: Promise<unknown> = Promise.resolve();

/**
 * 출력대 화면의 요청을 한 번에 하나씩 보낸다(#931). 출력대 화면은 claim·작업 목록·대기 경고·출력대 상태를
 * 함께 부르는데, 액세스 토큰이 만료된 순간 두 요청이 같은 refresh token 으로 재발급하면(BFF 의 Redis 락이 없을 때)
 * 두 번째가 실패해 로그아웃된다. 동시에 나가는 요청을 없애 그 경합을 막는다
 */
const enqueue = <T>(run: () => Promise<T>): Promise<T> => {
  const next = tail.then(run, run);
  tail = next.catch(() => undefined);
  return next;
};

const withTimeout = (config?: AxiosRequestConfig): AxiosRequestConfig => ({
  timeout: REQUEST_TIMEOUT_MS,
  ...config,
});

export const serialHttp = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    enqueue<AxiosResponse<T>>(() =>
      clientTokenInstance.get<T>(url, withTimeout(config)),
    ),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    enqueue<AxiosResponse<T>>(() =>
      clientTokenInstance.post<T>(url, data, withTimeout(config)),
    ),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    enqueue<AxiosResponse<T>>(() =>
      clientTokenInstance.patch<T>(url, data, withTimeout(config)),
    ),
};
