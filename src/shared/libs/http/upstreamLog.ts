import https from 'https';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { isRetried } from './retryUpstream';
import { upstreamAlert } from './upstreamAlert';
import type { Socket } from 'net';

const START_KEY = '__startedAt';

type TimedConfig = InternalAxiosRequestConfig & { [START_KEY]?: number };

// 쿼리에는 전화번호 같은 개인정보가 실릴 수 있어 경로까지만 남긴다
export const toLoggableUrl = (uri: string) => {
  try {
    const { origin, pathname } = new URL(uri);
    return `${origin}${pathname}`;
  } catch {
    return uri.split('?')[0];
  }
};

const ENDPOINTS_KEY = '__endpoints';

type Endpoints = Pick<
  SocketLike,
  'localAddress' | 'localPort' | 'remoteAddress' | 'remotePort'
>;

const EVENTS_KEY = '__events';

// 정상 연결은 수십 ms 안에 맺어진다. 첫 SYN 이 유실돼도 1초 뒤 재전송으로 맺어지므로 그보다 넉넉히 둔다
export const CONNECT_TIMEOUT_MS = 2_000;

type TracedSocket = Socket & {
  [ENDPOINTS_KEY]?: Endpoints;
  [EVENTS_KEY]?: string[];
};

/**
 * 타임아웃으로 소켓이 destroy 되면 localPort·remotePort 가 비어 서버 tcpdump 와 맞춰 볼 수 없다.
 * 연결이 맺어진 시점의 주소·포트를 소켓에 저장해 두고 실패 로그에서 읽는다
 */
export class TracedHttpsAgent extends https.Agent {
  createConnection(
    ...args: Parameters<https.Agent['createConnection']>
  ): Socket {
    const socket = super.createConnection(...args) as TracedSocket;
    const createdAt = Date.now();
    const events: string[] = [];
    socket[EVENTS_KEY] = events;
    // 소켓이 만들어진 뒤 단계마다 걸린 시간을 남겨, 연결이 DNS 조회·TCP 연결·TLS 중 어디서 멈췄는지 가린다
    const mark = (name: string) =>
      events.push(`${name}+${Date.now() - createdAt}ms`);
    socket.once('lookup', (err: Error | null, address: string) => {
      mark(err ? `lookup-error(${err.message})` : `lookup(${address})`);
    });
    socket.once('close', () => mark('close'));
    // 504 가 나는 인스턴스는 SYN-ACK 가 오지 않아 요청 timeout 까지 붙잡힌다.
    // TCP 연결 단계만 짧게 끊어 빨리 실패시키고, 재시도 대상(ETIMEDOUT)으로 넘긴다
    const connectTimer = setTimeout(() => {
      socket.destroy(
        Object.assign(
          new Error(`connect timeout of ${CONNECT_TIMEOUT_MS}ms exceeded`),
          { code: 'ETIMEDOUT' },
        ),
      );
    }, CONNECT_TIMEOUT_MS);
    socket.once('connect', () => clearTimeout(connectTimer));
    socket.once('close', () => clearTimeout(connectTimer));
    // 배포 환경에서 어느 시점에 주소·포트가 잡히는지 알 수 있게 이벤트마다 저장을 시도한다
    (['connect', 'secureConnect'] as const).forEach((event) => {
      socket.once(event, () => {
        mark(event);
        if (!socket.localPort && !socket.remotePort) return;
        socket[ENDPOINTS_KEY] = {
          localAddress: socket.localAddress,
          localPort: socket.localPort,
          remoteAddress: socket.remoteAddress,
          remotePort: socket.remotePort,
        };
      });
    });
    return socket;
  }
}

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

type RequestLike = {
  reusedSocket?: boolean;
  socket?: SocketLike | null;
};

type SystemErrorLike = {
  errno?: number | string;
  syscall?: string;
  address?: string;
  port?: number;
};

/**
 * 실패한 요청의 소켓이 TCP 연결까지 갔는지. 연결 이벤트를 기록하지 못한 소켓(에이전트 대기 등)은 알 수 없어 undefined 다.
 * keepAlive 로 재사용한 소켓은 처음 만들 때의 connect 가 남아 있어 true 다
 */
export const reachedTcpConnect = (error: AxiosError): boolean | undefined => {
  const socket = (error.request as RequestLike | undefined)?.socket as
    | TracedSocket
    | null
    | undefined;
  const events = socket?.[EVENTS_KEY];
  if (!events) return undefined;
  return events.some((event) => event.startsWith('connect'));
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
  const tracedSocket = socket as TracedSocket | null | undefined;
  const endpoints = tracedSocket?.[ENDPOINTS_KEY];
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
      // true 면 네트워크 오류로 다시 보낸 두 번째 시도의 실패다. 첫 시도 로그와 짝으로 복구 여부를 가른다
      retried: isRetried(config),
      // 같은 인스턴스의 실패를 묶고, 출구 IP 로 서버·학교망 방화벽 기록과 맞춰 본다 (조회 전이면 비어 있다)
      instance: upstreamAlert.instanceId,
      egressIp: upstreamAlert.getEgressIp(),
      code: error.code,
      message: error.message,
      // true 면 keepAlive 로 재사용한 연결로 나간 요청이다. 중간 장비가 조용히 끊은 연결이면 응답 없이 timeout 이 난다
      reusedSocket: request?.reusedSocket,
      // 주소·포트는 연결 시점에 저장해 둔 값을 우선 쓴다 (destroy 후에는 소켓에서 비어 나온다)
      socket: socket && {
        localAddress: endpoints?.localAddress ?? socket.localAddress,
        localPort: endpoints?.localPort ?? socket.localPort,
        remoteAddress: endpoints?.remoteAddress ?? socket.remoteAddress,
        remotePort: endpoints?.remotePort ?? socket.remotePort,
        bytesWritten: socket.bytesWritten,
        bytesRead: socket.bytesRead,
        connecting: socket.connecting,
        destroyed: socket.destroyed,
      },
      // 주소·포트가 비면 원인을 가리는 진단 값. events 가 비면 TracedHttpsAgent 의 연결 경로를 타지 않았거나 연결 이벤트가 오지 않은 것이다
      trace: {
        events: tracedSocket?.[EVENTS_KEY],
        stored: Boolean(endpoints),
        node: process.version,
      },
      errno: sysError.errno,
      syscall: sysError.syscall,
      address: sysError.address,
      port: sysError.port,
    }),
  );
};
