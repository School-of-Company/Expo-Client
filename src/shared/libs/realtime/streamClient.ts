import { createSseParser, SseMessage } from './sseParser';

/**
 * - connecting: 처음 연결 중
 * - connected: 스트림이 열려 있음(이때만 화면 polling 을 멈춘다)
 * - reconnecting: 끊겨서 다시 연결 대기·시도 중
 * - fallback: 재시도 한도를 넘어 멈춤. polling·수동 새로고침으로 갱신한다
 * - denied: 401/403. 같은 자격으로는 다시 붙지 않는다
 */
export type StreamStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'fallback'
  | 'denied';

interface StreamClientOptions {
  url: string;
  /** 연결이 열릴 때마다(최초·재연결). 놓쳤을 수 있는 변경을 GET 으로 다시 맞춘다 */
  onOpen: () => void;
  onMessage: (message: SseMessage) => void;
  onStatus: (status: StreamStatus) => void;
}

const INITIAL_RETRY_MS = 1_000;
const MAX_RETRY_MS = 30_000;
// 이 횟수만큼 연달아 실패하면 재시도를 멈추고 polling 으로 돌린다
const MAX_FAILURES = 6;
// heartbeat 를 포함해 아무 바이트도 이만큼 오지 않으면 끊긴 연결로 본다
const IDLE_TIMEOUT_MS = 45_000;
// 이보다 짧게 살다 끊긴 연결은 실패로 센다. 열자마자 끊는 서버에 1초마다 붙지 않기 위해서다
const HEALTHY_CONNECTION_MS = 10_000;

class StreamDeniedError extends Error {}

/**
 * 같은 출처 BFF 스트림을 fetch 로 읽는다. EventSource 와 달리 401/403 을 구분해 재연결을 멈출 수 있다.
 * 끊기면 지수 백오프(지터 포함)로 다시 붙고, 한도를 넘으면 fallback 으로 멈춘다
 */
export const createStreamClient = ({
  url,
  onOpen,
  onMessage,
  onStatus,
}: StreamClientOptions) => {
  let status: StreamStatus | null = null;
  let controller: AbortController | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let idleTimer: ReturnType<typeof setTimeout> | undefined;
  let failures = 0;
  let serverRetryMs = 0;
  let lastEventId: string | undefined;
  let stopped = true;

  const setStatus = (next: StreamStatus) => {
    if (status === next) return;
    status = next;
    onStatus(next);
  };

  const clearTimers = () => {
    clearTimeout(retryTimer);
    clearTimeout(idleTimer);
    retryTimer = undefined;
    idleTimer = undefined;
  };

  const scheduleReconnect = () => {
    if (stopped) return;
    failures += 1;
    if (failures > MAX_FAILURES) {
      setStatus('fallback');
      return;
    }
    const backoff = Math.min(
      MAX_RETRY_MS,
      INITIAL_RETRY_MS * 2 ** (failures - 1),
    );
    const delay = Math.max(serverRetryMs, backoff * (0.5 + Math.random() / 2));
    setStatus('reconnecting');
    retryTimer = setTimeout(connect, delay);
  };

  async function connect() {
    retryTimer = undefined;
    if (stopped) return;
    const current = new AbortController();
    controller = current;
    let openedAt = 0;

    const armIdle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => current.abort(), IDLE_TIMEOUT_MS);
    };

    try {
      armIdle();
      const response = await fetch(url, {
        headers: {
          Accept: 'text/event-stream',
          ...(lastEventId && { 'Last-Event-ID': lastEventId }),
        },
        credentials: 'same-origin',
        cache: 'no-store',
        signal: current.signal,
      });
      if (response.status === 401 || response.status === 403) {
        throw new StreamDeniedError();
      }
      if (!response.ok || !response.body) throw new Error('stream failed');

      openedAt = Date.now();
      setStatus('connected');
      onOpen();

      const parser = createSseParser({
        onMessage: (message) => {
          lastEventId = parser.lastEventId;
          onMessage(message);
        },
        onRetry: (ms) => {
          serverRetryMs = Math.min(ms, MAX_RETRY_MS);
        },
      });
      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();
      for (;;) {
        armIdle();
        const { done, value } = await reader.read();
        if (done) break;
        parser.push(value);
      }
    } catch (error) {
      if (error instanceof StreamDeniedError) {
        clearTimers();
        stopped = true;
        setStatus('denied');
        return;
      }
    } finally {
      clearTimeout(idleTimer);
      if (controller === current) controller = null;
    }

    // 서버가 연결을 닫은 경우(연결 수명 만료 등)도, 네트워크 오류·idle 타임아웃도 다시 붙는다
    if (stopped) return;
    // 충분히 살아 있던 연결이 끊겼으면 첫 재시도부터 다시 센다
    if (openedAt && Date.now() - openedAt >= HEALTHY_CONNECTION_MS) {
      failures = 0;
    }
    scheduleReconnect();
  }

  const start = () => {
    if (!stopped) return;
    stopped = false;
    failures = 0;
    setStatus('connecting');
    void connect();
  };

  return {
    start,
    stop() {
      stopped = true;
      clearTimers();
      controller?.abort();
      controller = null;
    },
    /**
     * 화면 복귀·네트워크 복구 때. 재시도 대기 중이거나 fallback 이면 바로 다시 붙는다.
     * denied 는 자격이 바뀌지 않았으므로 다시 붙지 않는다
     */
    resume() {
      if (status === 'denied') return;
      if (status === 'fallback') {
        stopped = true;
        start();
        return;
      }
      if (retryTimer !== undefined) {
        clearTimeout(retryTimer);
        void connect();
      }
    },
    get status() {
      return status;
    },
  };
};
