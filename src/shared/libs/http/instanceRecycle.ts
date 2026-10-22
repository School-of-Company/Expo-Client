export const RECYCLE_THRESHOLD = 3;
// 지금 실패한 요청의 504 응답이 나갈 시간을 두고 종료한다
export const RECYCLE_EXIT_DELAY_MS = 200;

type Options = {
  enabled: boolean;
  exit?: (code: number) => void;
  log?: (label: string, payload: Record<string, unknown>) => void;
  threshold?: number;
  exitDelayMs?: number;
};

/**
 * 504 를 내는 Vercel 인스턴스는 처음부터 Gateway 와 TCP 연결을 한 번도 맺지 못하고 끝까지 회복하지 않는다.
 * 그런데도 트래픽을 계속 받아 몇 분씩 살아 있으므로, 그런 인스턴스는 스스로 내려 Vercel 이 새 인스턴스로 바꾸게 한다.
 * 한 번이라도 연결된 인스턴스는 Gateway 자체 문제일 수 있어 내리지 않는다
 */
export const createInstanceRecycle = ({
  enabled,
  exit = (code) => process.exit(code),
  log = (label, payload) => console.error(label, JSON.stringify(payload)),
  threshold = RECYCLE_THRESHOLD,
  exitDelayMs = RECYCLE_EXIT_DELAY_MS,
}: Options) => {
  let everConnected = false;
  let consecutiveFailures = 0;
  let exiting = false;

  return {
    /** Gateway 와 TCP 연결을 맺은 적이 있다 (응답을 받았거나, 연결 뒤에 실패했다) */
    recordConnected: () => {
      everConnected = true;
      consecutiveFailures = 0;
    },
    /** TCP 연결 단계에서 실패했다. 이 인스턴스를 내리기로 했으면 true */
    recordConnectFailure: (context: Record<string, unknown>) => {
      if (everConnected || exiting) return false;
      consecutiveFailures += 1;
      if (consecutiveFailures < threshold) return false;
      exiting = true;
      log('[gateway-instance-recycle]', {
        ...context,
        failures: consecutiveFailures,
        // false 면 로컬 개발이라 로그만 남기고 내리지 않는다
        exiting: enabled,
      });
      if (enabled) setTimeout(() => exit(1), exitDelayMs);
      return enabled;
    },
  };
};

export const instanceRecycle = createInstanceRecycle({
  enabled: process.env.VERCEL === '1',
});
