import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { clientIpHeaders } from '@/shared/libs/http/clientIp';
import { GATEWAY_URL } from '@/shared/libs/http/serverInstance';
import { RefreshUnavailableError } from './refreshAccessToken';
import { createErrorResponse } from './response';
import { performTokenRefresh } from './token';

// 응답 헤더를 받을 때까지만 기다린다. 연결된 뒤에는 heartbeat 가 오는 한 끊지 않는다
const CONNECT_TIMEOUT_MS = 10_000;
const LAST_EVENT_ID_MAX_LENGTH = 200;

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  // no-transform: Next 압축이 스트림을 모았다 보내지 않게 한다
  'Cache-Control': 'no-cache, no-store, no-transform',
  // 앞단 nginx 류 프록시가 버퍼링하지 않게 한다
  'X-Accel-Buffering': 'no',
};

// 쿠키는 지우지 않는다. 실시간 연결은 재연결이 잦아 다른 요청과 재발급이 겹치기 쉬운데,
// 여기서 지우면 겹친 요청이 방금 받은 새 토큰 쿠키까지 사라져 화면이 조용히 로그아웃된다.
// 정말 만료된 세션은 일반 API 의 재발급 실패 응답이 쿠키를 정리하고 로그인으로 보낸다
const refreshFailedResponse = (message: string) =>
  createErrorResponse(message, 401, true);

/**
 * 관리자 SSE 를 같은 출처에서 그대로 흘려보낸다. native EventSource 는 Authorization 을 못 싣고
 * 토큰은 HttpOnly 쿠키에만 있으므로, 서버에서 토큰을 붙여 Gateway 스트림을 열고
 * 본문을 모으지 않고 받는 대로 넘긴다. 브라우저가 끊으면 Gateway 연결도 끊는다
 */
export async function streamHandleRequest(
  req: NextRequest,
  upstreamPath: string,
): Promise<NextResponse> {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;
  let accessToken = cookieStore.get('accessToken')?.value;

  const upstream = new AbortController();
  const abortUpstream = () => upstream.abort();
  req.signal.addEventListener('abort', abortUpstream, { once: true });

  const lastEventId = req.headers.get('last-event-id');
  const open = async (token: string) => {
    const timer = setTimeout(abortUpstream, CONNECT_TIMEOUT_MS);
    try {
      return await fetch(`${GATEWAY_URL}${upstreamPath}`, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
          Authorization: `Bearer ${token}`,
          ...(lastEventId &&
            lastEventId.length <= LAST_EVENT_ID_MAX_LENGTH && {
              'Last-Event-ID': lastEventId,
            }),
          ...clientIpHeaders(req),
        },
        cache: 'no-store',
        signal: upstream.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  };

  // 401 이면 한 번만 재발급한다. 재발급도 안 되면 클라이언트가 재연결을 멈추도록 401 로 끝낸다
  const refresh = async (): Promise<string | NextResponse> => {
    if (!refreshToken) return refreshFailedResponse('Refresh token 없음');
    try {
      const tokens = await performTokenRefresh(refreshToken);
      return tokens?.accessToken ?? refreshFailedResponse('토큰 갱신 실패');
    } catch (error) {
      if (!(error instanceof RefreshUnavailableError)) throw error;
      return createErrorResponse(error.message, 503);
    }
  };

  let response: Response;
  try {
    if (!accessToken) {
      const refreshed = await refresh();
      if (typeof refreshed !== 'string') return refreshed;
      accessToken = refreshed;
    }
    response = await open(accessToken);
    if (response.status === 401) {
      await response.body?.cancel().catch(() => undefined);
      const refreshed = await refresh();
      if (typeof refreshed !== 'string') return refreshed;
      response = await open(refreshed);
      if (response.status === 401) {
        await response.body?.cancel().catch(() => undefined);
        return refreshFailedResponse('토큰 재발급 후 재시도 실패');
      }
    }
  } catch {
    if (req.signal.aborted) return new NextResponse(null, { status: 499 });
    return createErrorResponse(
      '실시간 갱신 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.',
      upstream.signal.aborted ? 504 : 502,
    );
  }

  const isEventStream = (response.headers.get('content-type') ?? '').includes(
    'text/event-stream',
  );
  if (!response.ok || !response.body || !isEventStream) {
    await response.body?.cancel().catch(() => undefined);
    const status = response.ok ? 502 : response.status;
    return createErrorResponse(
      status === 403
        ? '이 행사의 실시간 갱신을 구독할 권한이 없습니다.'
        : '실시간 갱신을 시작하지 못했습니다.',
      status,
    );
  }

  // pull 로 한 조각씩 넘겨 Next 가 본문을 모으지 않게 하고, 브라우저가 끊으면(cancel) Gateway 도 끊는다
  const reader = response.body.getReader();
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        controller.enqueue(value);
      } catch (error) {
        controller.error(error);
      }
    },
    cancel() {
      abortUpstream();
      reader.cancel().catch(() => undefined);
    },
  });

  return new NextResponse(body, { status: 200, headers: SSE_HEADERS });
}
