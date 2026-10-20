'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// 서버 인증번호 유효시간(Notification authCodeTtlSeconds)
const SMS_CODE_EXPIRY_MS = 300_000;

/**
 * 인증번호 남은 시간. 서버는 번호마다 처음 보낸 때부터 창을 열고, 창 안에서 다시 보내도 늘리지 않으므로
 * 번호별 첫 마감 시각을 유지한다. 인터벌 횟수가 아니라 마감 시각으로 계산해, 백그라운드에서
 * 타이머가 멈췄다가 돌아와도(visibilitychange) 실제 남은 시간을 보여 준다
 */
export const useSmsCodeCountdown = () => {
  const deadlines = useRef(new Map<string, number>());
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const isExpired = deadline !== null && now >= deadline;

  useEffect(() => {
    if (deadline === null || isExpired) return;
    const tick = () => setNow(Date.now());
    const intervalId = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [deadline, isExpired]);

  /** 전송 성공 뒤 부른다 */
  const start = useCallback((phoneNumber: string) => {
    const current = Date.now();
    const saved = deadlines.current.get(phoneNumber);
    const next =
      saved !== undefined && saved > current
        ? saved
        : current + SMS_CODE_EXPIRY_MS;
    deadlines.current.set(phoneNumber, next);
    setNow(current);
    setDeadline(next);
  }, []);

  /** 화면 표시만 멈춘다. 같은 번호로 다시 보내면 남은 마감 시각을 이어 쓴다 */
  const clear = useCallback(() => setDeadline(null), []);

  const remainingSeconds =
    deadline === null ? 0 : Math.max(0, Math.ceil((deadline - now) / 1000));

  return { remainingSeconds, isExpired, start, clear };
};
