/**
 * 창을 최소화하거나 다른 탭으로 가려도 늦어지지 않는 타이머(#931).
 * Chrome 은 숨겨진 탭의 이어지는 setTimeout 을 몇 분 뒤 1분에 1번으로 늦추지만 Worker 의 타이머는 그렇게 하지 않는다.
 * Worker 를 만들 수 없으면 window.setTimeout 으로 돌아간다
 */
export interface BackgroundTimer {
  set: (callback: () => void, ms: number) => void;
  clear: () => void;
  dispose: () => void;
}

const WORKER_SOURCE =
  'var t;onmessage=function(e){clearTimeout(t);if(e.data>=0)t=setTimeout(function(){postMessage(0)},e.data)}';

export const createBackgroundTimer = (): BackgroundTimer => {
  let callback: (() => void) | null = null;
  let worker: Worker | null = null;
  let url: string | null = null;
  let fallback: number | undefined;

  try {
    url = URL.createObjectURL(
      new Blob([WORKER_SOURCE], { type: 'text/javascript' }),
    );
    worker = new Worker(url);
    worker.onmessage = () => {
      const run = callback;
      callback = null;
      run?.();
    };
  } catch {
    worker = null;
  }

  return {
    set: (next, ms) => {
      callback = next;
      if (worker) worker.postMessage(ms);
      else {
        window.clearTimeout(fallback);
        fallback = window.setTimeout(() => {
          callback = null;
          next();
        }, ms);
      }
    },
    clear: () => {
      callback = null;
      if (worker) worker.postMessage(-1);
      else window.clearTimeout(fallback);
    },
    dispose: () => {
      callback = null;
      window.clearTimeout(fallback);
      worker?.terminate();
      if (url) URL.revokeObjectURL(url);
    },
  };
};
