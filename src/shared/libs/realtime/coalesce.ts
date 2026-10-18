interface CoalesceOptions {
  /** 신호를 받고 이만큼 모아서 한 번에 조회한다(ms) */
  delayMs: number;
  /** 조회 시작 사이의 최소 간격(ms). 연속 스캔에도 조회가 몰리지 않게 한다 */
  minIntervalMs?: number;
  now?: () => number;
  setTimer?: (run: () => void, ms: number) => unknown;
  clearTimer?: (timer: unknown) => void;
}

/**
 * 연속 신호를 하나의 재조회로 합친다. 조회 중 들어온 신호는 버리지 않고
 * 끝난 뒤 한 번 더 조회해 마지막 변경을 놓치지 않는다
 */
export const createCoalescedRunner = (
  run: () => Promise<unknown>,
  {
    delayMs,
    minIntervalMs = 0,
    now = Date.now,
    setTimer = (callback, ms) => setTimeout(callback, ms),
    clearTimer = (timer) =>
      clearTimeout(timer as ReturnType<typeof setTimeout>),
  }: CoalesceOptions,
) => {
  let timer: unknown;
  let running = false;
  let pending = false;
  let disposed = false;
  let lastStartedAt = -Infinity;

  const schedule = () => {
    if (disposed || timer !== undefined) return;
    const wait = Math.max(delayMs, lastStartedAt + minIntervalMs - now());
    timer = setTimer(start, wait);
  };

  async function start() {
    timer = undefined;
    if (disposed) return;
    running = true;
    pending = false;
    lastStartedAt = now();
    try {
      await run();
    } catch {
      // 조회 실패는 각 조회의 오류 상태로 보여 준다
    } finally {
      running = false;
      if (pending) schedule();
    }
  }

  return {
    trigger() {
      if (disposed) return;
      if (running) {
        pending = true;
        return;
      }
      schedule();
    },
    dispose() {
      disposed = true;
      if (timer !== undefined) clearTimer(timer);
      timer = undefined;
    },
  };
};

/** 최근 이벤트 ID 를 한도만큼만 기억해 같은 이벤트를 두 번 처리하지 않는다 */
export const createRecentIds = (limit: number) => {
  const ids = new Set<string>();
  return {
    /** 처음 보는 ID 면 기억하고 true */
    add(id: string) {
      if (ids.has(id)) return false;
      ids.add(id);
      if (ids.size > limit) {
        const oldest = ids.values().next().value;
        if (oldest !== undefined) ids.delete(oldest);
      }
      return true;
    },
  };
};
