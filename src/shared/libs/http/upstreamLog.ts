import { AxiosError, InternalAxiosRequestConfig } from 'axios';

const START_KEY = '__startedAt';

type TimedConfig = InternalAxiosRequestConfig & { [START_KEY]?: number };

// 쿼리에는 전화번호 같은 개인정보가 실릴 수 있어 경로까지만 남긴다
const toLoggableUrl = (uri: string) => {
  try {
    const { origin, pathname } = new URL(uri);
    return `${origin}${pathname}`;
  } catch {
    return uri.split('?')[0];
  }
};

type SocketLike = {
  localAddress?: string;
  localPort?: number;
  remoteAddress?: string;
  remotePort?: number;
  bytesWritten?: number;
  bytesRead?: number;
  connecting?: boolean;
  destroyed?: boolean;
};

type RequestLike = { reusedSocket?: boolean; socket?: SocketLike | null };

type SystemErrorLike = {
  errno?: number | string;
  syscall?: string;
  address?: string;
  port?: number;
};

export const markUpstreamStart = (config: InternalAxiosRequestConfig) => {
  (config as TimedConfig)[START_KEY] = Date.now();
  return config;
};

/**
 * Gateway 호출이 실패했을 때(응답 없음 또는 5xx) Vercel 로그에 한 줄로 남긴다.
 * 504 시각과 a.glink.kr/expo/... 원본 URL 을 Gateway·Apache 로그와 맞춰 보기 위한 용도
 */
export const logUpstreamFailure = (
  error: AxiosError,
  getUri: (config: InternalAxiosRequestConfig) => string,
) => {
  const status = error.response?.status;
  if (status !== undefined && status < 500) return;

  const config = error.config as TimedConfig | undefined;
  const request = error.request as RequestLike | undefined;
  const socket = request?.socket;
  const sysError = ((error.cause as SystemErrorLike | undefined) ??
    (error as unknown as SystemErrorLike)) as SystemErrorLike;
  const startedAt = config?.[START_KEY];
  console.error(
    '[gateway-upstream-failure]',
    JSON.stringify({
      at: new Date(startedAt ?? Date.now()).toISOString(),
      method: config?.method?.toUpperCase(),
      url: config ? toLoggableUrl(getUri(config)) : undefined,
      status: status ?? null,
      elapsedMs: startedAt ? Date.now() - startedAt : undefined,
      timeoutMs: config?.timeout,
      code: error.code,
      message: error.message,
      // true 면 keepAlive 로 재사용한 연결로 나간 요청이다. 중간 장비가 조용히 끊은 연결이면 응답 없이 timeout 이 난다
      reusedSocket: request?.reusedSocket,
      // 타임아웃으로 끊긴 소켓은 이미 destroyed 일 수 있어 주소가 비어 있을 수 있다
      socket: socket && {
        localAddress: socket.localAddress,
        localPort: socket.localPort,
        remoteAddress: socket.remoteAddress,
        remotePort: socket.remotePort,
        bytesWritten: socket.bytesWritten,
        bytesRead: socket.bytesRead,
        connecting: socket.connecting,
        destroyed: socket.destroyed,
      },
      errno: sysError.errno,
      syscall: sysError.syscall,
      address: sysError.address,
      port: sysError.port,
    }),
  );
};
