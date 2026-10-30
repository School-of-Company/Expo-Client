'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import {
  BadgePrintClaim,
  BadgePrintOutcome,
  claimBadgePrintJob,
  getBadgePrintStations,
  openBadgePrintSession,
  reportBadgePrintResult,
  updateBadgePrintStation,
} from '../api/badgePrintApi';
import { BeforePrintError, printBadgeInFrame } from './printBadgeInFrame';

// 서버와 정한 수신 주기(Expo-User-Server#236). 공용 IP 요청 제한 안에서 5대가 함께 돈다
const POLL_INTERVAL_MS = 2000;
// 작업을 하나 끝내면 대기열이 남아 있을 수 있어 바로 다음을 묻는다
const NEXT_JOB_DELAY_MS = 300;
// 오류가 나면 서버가 회복할 시간을 둔다
const ERROR_RETRY_MS = 5000;
// 서버 점유 30초보다 조금 짧게 둔다
const REPORT_RETRY_WINDOW_MS = 25000;
const RECENT_LIMIT = 10;

export type StationState =
  | 'connecting'
  | 'running'
  | 'taken-over'
  | 'not-found'
  | 'forbidden'
  | 'error';

export interface PrintedBadge {
  jobId: number;
  name: string;
  school: string | null;
  at: string;
  // ok: 인쇄 요청함, retry: 인쇄 전 실패라 서버가 다시 줌, check: 결과를 서버에 남기지 못해 확인 필요
  result: 'ok' | 'retry' | 'check';
}

const timeText = () =>
  new Date().toLocaleTimeString('ko-KR', { hour12: false });

const wait = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

/**
 * 출력대 한 대의 자동 출력 루프. 세션을 열고 2초마다 claim 해서 받은 명찰을 iframe 으로 인쇄한 뒤 결과를 보고한다.
 * 같은 출력대를 다른 탭·노트북이 열면 서버가 409 를 주므로 멈추고 알린다
 */
export const useBadgePrintStation = (expoId: string, stationId: string) => {
  const [state, setState] = useState<StationState>('connecting');
  const [label, setLabel] = useState<string>('');
  const [paused, setPaused] = useState(false);
  const [current, setCurrent] = useState<BadgePrintClaim | null>(null);
  const [recent, setRecent] = useState<PrintedBadge[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  // 세션을 다시 열 때마다 올려 이전 루프를 끝낸다
  const [generation, setGeneration] = useState(0);

  const sessionRef = useRef<string | null>(null);
  // 응답을 못 받은 claim 은 같은 requestId 로 다시 보내야 같은 작업을 다시 받는다
  const pendingRequestRef = useRef<string | null>(null);

  const addRecent = useCallback((item: PrintedBadge) => {
    setRecent((prev) => [item, ...prev].slice(0, RECENT_LIMIT));
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const schedule = (ms: number, run: () => Promise<void>) => {
      if (cancelled) return;
      timer = window.setTimeout(() => {
        void run();
      }, ms);
    };

    const report = async (
      job: BadgePrintClaim,
      claimedAt: number,
      outcome: BadgePrintOutcome,
      reason?: string,
    ) => {
      // 점유가 유효한 동안(서버 30초) 같은 본문으로 다시 보낸다. 다음 claim 으로 넘어가면 서버가 이 작업을
      // 결과 없는 점유로 보고 확인 필요로 돌리기 때문이다
      const deadline = claimedAt + REPORT_RETRY_WINDOW_MS;
      let delay = 1000;
      while (!cancelled) {
        try {
          await reportBadgePrintResult(expoId, job.jobId, {
            sessionId: sessionRef.current ?? '',
            claimToken: job.claimToken,
            outcome,
            reason,
          });
          return true;
        } catch (error) {
          // 409: 30초가 지나 확인 필요로 넘어갔거나 다른 세션이 열었다. 다시 보내도 바뀌지 않는다
          if (getErrorStatus(error) === 409) return false;
          if (Date.now() + delay > deadline) return false;
          await wait(delay);
          delay = Math.min(delay * 2, 4000);
        }
      }
      return false;
    };

    const tick = async () => {
      if (cancelled || !sessionRef.current) return;
      const requestId = pendingRequestRef.current ?? crypto.randomUUID();
      pendingRequestRef.current = requestId;

      let job: BadgePrintClaim | null;
      try {
        job = await claimBadgePrintJob(
          expoId,
          stationId,
          sessionRef.current,
          requestId,
        );
        pendingRequestRef.current = null;
        setLastError(null);
      } catch (error) {
        if (cancelled) return;
        const status = getErrorStatus(error);
        if (status === 409) {
          pendingRequestRef.current = null;
          setState('taken-over');
          return;
        }
        // 출력대가 지워졌거나(404) 권한이 없으면(403) 다시 물어도 풀리지 않아 멈추고 알린다
        if (status === 404 || status === 403) {
          pendingRequestRef.current = null;
          setState(status === 404 ? 'not-found' : 'forbidden');
          return;
        }
        // 응답을 못 받았으면 requestId 를 그대로 두고 다시 묻는다
        if (status !== undefined) pendingRequestRef.current = null;
        setLastError(
          error instanceof Error
            ? error.message
            : '출력 작업을 받지 못했습니다.',
        );
        schedule(ERROR_RETRY_MS, tick);
        return;
      }

      if (cancelled) return;
      if (!job) {
        schedule(POLL_INTERVAL_MS, tick);
        return;
      }

      const claimedAt = Date.now();
      setCurrent(job);
      let outcome: BadgePrintOutcome = 'SUBMITTED';
      let reason: string | undefined;
      try {
        await printBadgeInFrame(job);
      } catch (error) {
        // print() 를 부르기 전 실패만 재시도 대상이다. 그 밖은 종이가 나왔을 수 있어 인쇄 요청으로 본다
        if (error instanceof BeforePrintError) {
          outcome = 'FAILED_BEFORE_PRINT';
          reason = error.message.slice(0, 200);
        }
      }

      const reported = await report(job, claimedAt, outcome, reason);
      setCurrent(null);
      addRecent({
        jobId: job.jobId,
        name: job.name,
        school: job.school,
        at: timeText(),
        result: !reported ? 'check' : outcome === 'SUBMITTED' ? 'ok' : 'retry',
      });
      schedule(NEXT_JOB_DELAY_MS, tick);
    };

    const open = async () => {
      setState('connecting');
      try {
        const sessionId = await openBadgePrintSession(expoId, stationId);
        if (cancelled) return;
        sessionRef.current = sessionId;
        pendingRequestRef.current = null;
        setState('running');
        setLastError(null);
        // 이름·일시정지 상태는 표시용이라 실패해도 출력은 계속한다
        getBadgePrintStations(expoId)
          .then((stations) => {
            const station = stations.find((it) => it.stationId === stationId);
            if (!cancelled && station) {
              setLabel(station.label);
              setPaused(station.paused);
            }
          })
          .catch(() => undefined);
        schedule(0, tick);
      } catch (error) {
        if (cancelled) return;
        const status = getErrorStatus(error);
        if (status === 404 || status === 403) {
          setState(status === 404 ? 'not-found' : 'forbidden');
          return;
        }
        setState('error');
        setLastError(
          error instanceof Error ? error.message : '출력대를 열지 못했습니다.',
        );
        schedule(ERROR_RETRY_MS, open);
      }
    };

    void open();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [expoId, stationId, generation, addRecent]);

  /** 다른 곳에서 연 출력대를 이 화면에서 다시 연다. 그쪽은 이후 409 로 멈춘다 */
  const reopen = useCallback(() => setGeneration((value) => value + 1), []);

  const togglePaused = useCallback(async () => {
    const next = !paused;
    try {
      await updateBadgePrintStation(expoId, stationId, next);
      setPaused(next);
      setLastError(null);
    } catch (error) {
      setLastError(
        error instanceof Error
          ? error.message
          : '출력대 상태를 바꾸지 못했습니다.',
      );
    }
  }, [expoId, stationId, paused]);

  return {
    state,
    label,
    paused,
    current,
    recent,
    lastError,
    reopen,
    togglePaused,
  };
};
