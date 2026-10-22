import axios, { InternalAxiosRequestConfig } from 'axios';
import { instanceRecycle } from './instanceRecycle';
import { markRetried, retryOnNetworkError } from './retryUpstream';
import { upstreamAlert } from './upstreamAlert';
import {
  TracedHttpsAgent,
  logUpstreamFailure,
  markUpstreamStart,
  reachedTcpConnect,
  toLoggableUrl,
} from './upstreamLog';

// Gateway 주소는 서버에서만 쓴다. 배포 환경에 BASE_URL 이 생기기 전까지는 기존 값을 쓴다
export const GATEWAY_URL =
  process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL;

// 일반 요청은 5초(GET 은 네트워크 오류면 한 번 더 보낸다), 엑셀처럼 서버가 파일을 만드는 요청은 더 오래 기다린다
export const DEFAULT_TIMEOUT_MS = 5_000;
export const FILE_DOWNLOAD_TIMEOUT_MS = 60_000;

// 연결 timeout(ETIMEDOUT) 또는 연결 전에 요청 timeout(ECONNABORTED). 504 를 내는 인스턴스의 실패 모양이다
const CONNECT_STALL_CODES = new Set(['ETIMEDOUT', 'ECONNABORTED']);

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
    instanceRecycle.recordConnected();
    return response;
  },
  async (error) => {
    if (axios.isAxiosError(error)) {
      const getUri = (config: InternalAxiosRequestConfig) =>
        serverInstance.getUri(config);
      logUpstreamFailure(error, getUri);
      const connected = error.response ? true : reachedTcpConnect(error);
      if (connected) instanceRecycle.recordConnected();
      // 응답 없이 끊긴 실패만 센다. 서버가 응답한 5xx 는 연결 문제가 아니다
      if (!error.response) {
        const failure = {
          method: error.config?.method?.toUpperCase(),
          url: error.config ? toLoggableUrl(getUri(error.config)) : undefined,
          code: error.code,
        };
        // 알림이 먼저 나가야 인스턴스를 내리기 전에 출구 IP 를 전달할 수 있다
        await upstreamAlert.recordFailure(failure);
        // 응답 없이 연결 단계에서 시간만 지난 실패만 센다. ECONNREFUSED 처럼 바로 거절되면 서버까지는 닿은 것이라
        // 인스턴스 문제가 아니고, 서버가 내려간 동안 모든 인스턴스를 내리게 된다
        const recycling =
          connected === false &&
          CONNECT_STALL_CODES.has(error.code ?? '') &&
          instanceRecycle.recordConnectFailure({
            ...failure,
            instance: upstreamAlert.instanceId,
            egressIp: upstreamAlert.getEgressIp(),
          });
        // 곧 내려갈 인스턴스에서 다시 보내 봐야 같은 이유로 실패하므로, 504 를 바로 돌려준다
        if (recycling && error.config) markRetried(error.config);
      }
    }
    return Promise.reject(error);
  },
);
retryOnNetworkError(serverInstance, DEFAULT_TIMEOUT_MS);
