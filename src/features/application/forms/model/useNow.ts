import { useEffect, useState } from 'react';

// setTimeout 은 약 24.8일(2^31-1ms)을 넘으면 즉시 실행되므로 상한을 둔다
const MAX_DELAY = 2 ** 31 - 1;

/**
 * 현재 시각. 켜둔 화면에서도 다음 경계 시각(ms)에 도달하면 갱신해 표시를 바꾼다.
 * 지났거나 유효하지 않은 경계는 무시한다
 */
export const useNow = (boundaries: number[]) => {
  const [now, setNow] = useState(() => Date.now());
  const key = boundaries.join();

  useEffect(() => {
    const next = Math.min(
      ...boundaries.filter((boundary) => boundary > Date.now()),
    );
    if (!Number.isFinite(next)) return;
    const timer = setTimeout(
      () => setNow(Date.now()),
      Math.min(next - Date.now(), MAX_DELAY),
    );
    return () => clearTimeout(timer);
    // boundaries 는 key 로 비교한다
  }, [key, now]);

  return now;
};
