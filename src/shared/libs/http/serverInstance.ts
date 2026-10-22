import axios, { InternalAxiosRequestConfig } from 'axios';
import { retryOnNetworkError } from './retryUpstream';
import { upstreamAlert } from './upstreamAlert';
import {
  TracedHttpsAgent,
  logUpstreamFailure,
  markUpstreamStart,
  toLoggableUrl,
} from './upstreamLog';

// Gateway 주소는 서버에서만 쓴다. 배포 환경에 BASE_URL 이 생기기 전까지는 기존 값을 쓴다
export const GATEWAY_URL =
  process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL;

// 일반 요청은 5초(GET 은 네트워크 오류면 한 번 더 보낸다), 엑셀처럼 서버가 파일을 만드는 요청은 더 오래 기다린다
export const DEFAULT_TIMEOUT_MS = 5_000;
export const FILE_DOWNLOAD_TIMEOUT_MS = 60_000;

export const serverInstance = axios.create({
  baseURL: GATEWAY_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  // 프록시 요청마다 TLS 핸드셰이크를 다시 하지 않도록 연결을 재사용한다
  httpsAgent: new TracedHttpsAgent({ keepAlive: true, maxSockets: 50 }),
});

serverInstance.interceptors.request.use((config) => {
  upstreamAlert.prefetchEgressIp();
  return markUpstreamStart(config);
});
serverInstance.interceptors.response.use(
  (response) => {
    upstreamAlert.recordSuccess();
    return response;
  },
  async (error) => {
    if (axios.isAxiosError(error)) {
      const getUri = (config: InternalAxiosRequestConfig) =>
        serverInstance.getUri(config);
      logUpstreamFailure(error, getUri);
      // 응답 없이 끊긴 실패만 센다. 서버가 응답한 5xx 는 연결 문제가 아니다
      if (!error.response) {
        await upstreamAlert.recordFailure({
          method: error.config?.method?.toUpperCase(),
          url: error.config ? toLoggableUrl(getUri(error.config)) : undefined,
          code: error.code,
        });
      }
    }
    return Promise.reject(error);
  },
);
retryOnNetworkError(serverInstance, DEFAULT_TIMEOUT_MS);
