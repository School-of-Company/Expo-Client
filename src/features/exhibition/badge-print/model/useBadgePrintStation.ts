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
import { createBackgroundTimer } from './backgroundTimer';
import {
  clearPendingReport,
  loadPendingReport,
  outcomeOf,
  PendingReport,
  savePendingReport,
} from './pendingReport';
import { BeforePrintError, printBadgeInFrame } from './printBadgeInFrame';

// 서버와 정한 수신 주기(Expo-User-Server#236). 공용 IP 요청 제한 안에서 5대가 함께 돈다
const POLL_INTERVAL_MS = 2000;
// 작업을 하나 끝내면 대기열이 남아 있을 수 있어 바로 다음을 묻는다
const NEXT_JOB_DELAY_MS = 300;
// 실패가 이어지면 재시도 간격을 1초에서 30초까지 두 배씩 늘리고, 출력대 여러 대가 같은 박자로 몰리지 않게 흔든다(#931)
const RETRY_BASE_MS = 1000;
const RETRY_MAX_MS = 30_000;
// 요청 제한(429)에 걸리면 최소한 이만큼은 쉰다
const RATE_LIMIT_RETRY_MS = 10_000;
// 연속 오류가 이만큼이면 화면에 오류 상태로 크게 알린다(루프는 계속 돈다)
const ERROR_ALERT_COUNT = 3;
// 같은 브라우저의 다른 탭이 이 출력대를 잡고 있는지 알리기까지 기다리는 시간
const OTHER_TAB_NOTICE_MS = 500;
const RECENT_LIMIT = 10;
// 루프를 멈추고 다시 예약하지 않는다
const STOP = -1;

export type StationState =
  | 'connecting'
  | 'running'
  | 'other-tab'
  | 'unsupported'
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

const messageOf = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

/** n번째 연속 실패 뒤 기다릴 시간. 0.5~1.5배로 흔들어 여러 출력대가 동시에 다시 몰리지 않게 한다 */
const retryDelay = (failures: number, status?: number) => {
  const base = Math.min(
    RETRY_MAX_MS,
    RETRY_BASE_MS * 2 ** Math.max(0, failures - 1),
  );
  const jittered = Math.round(base * (0.5 + Math.random()));
  return status === 429 ? Math.max(jittered, RATE_LIMIT_RETRY_MS) : jittered;
};

/**
 * 출력대 한 대의 자동 출력 루프. 세션을 열고 2초마다 claim 해서 받은 명찰을 iframe 으로 인쇄한 뒤 결과를 보고한다.
 *
 * - 같은 브라우저의 탭끼리는 Web Locks 로 한 탭만 돈다. 다른 노트북·브라우저는 서버 세션(409)이 막는다
 * - 결과를 보고하기 전까지 기록을 localStorage 에 남겨, 새로고침·탭 종료 뒤 다시 열 때 먼저 보고한다(#929)
 * - 한 번의 실행에서 무엇이 던져져도 다음 실행을 예약해 루프가 조용히 멈추지 않는다
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
    // 창이 숨겨져도 늦어지지 않는 타이머
    const timer = createBackgroundTimer();
    let errorCount = 0;
    // 결과 보고가 이어서 실패한 횟수. 새 작업을 받기 전에 백오프로 다시 보낸다
    let reportFailures = 0;
    let lastStatus: number | undefined;
    let releaseLock: (() => void) | undefined;
    const lockAbort = new AbortController();

    const schedule = (ms: number, run: () => Promise<void>) => {
      if (cancelled) return;
      timer.set(() => {
        void run();
      }, ms);
    };

    const recordRecent = (
      report: PendingReport,
      result: PrintedBadge['result'],
    ) =>
      addRecent({
        jobId: report.jobId,
        name: report.name,
        school: report.school,
        at: timeText(),
        result,
      });

    /**
     * 남은 보고를 보낸다. 보냈거나 더 보낼 수 없으면(409·404: 이미 닫힘, 이전 서버) 기록을 지우고 true,
     * 응답을 못 받았으면 기록을 남기고 false(새 작업을 받지 않고 곧 다시 보낸다)
     */
    const settlePending = async () => {
      const pending = loadPendingReport(stationId);
      if (!pending) return true;
      const outcome = outcomeOf(pending);
      try {
        await reportBadgePrintResult(expoId, pending.jobId, {
          sessionId: sessionRef.current ?? '',
          claimToken: pending.claimToken,
          outcome,
          reason: pending.reason,
        });
        clearPendingReport(stationId);
        reportFailures = 0;
        recordRecent(pending, outcome === 'SUBMITTED' ? 'ok' : 'retry');
        return true;
      } catch (error) {
        const status = getErrorStatus(error);
        if (status === 409 || status === 404) {
          clearPendingReport(stationId);
          reportFailures = 0;
          recordRecent(pending, 'check');
          return true;
        }
        reportFailures += 1;
        lastStatus = status;
        setLastError(messageOf(error, '출력 결과를 보내지 못했습니다.'));
        return false;
      }
    };

    /** 한 번의 실행. 다음 실행까지 기다릴 시간(ms) 또는 STOP 을 돌려준다 */
    const step = async (): Promise<number> => {
      if (!(await settlePending()))
        return retryDelay(reportFailures, lastStatus);
      if (cancelled || !sessionRef.current) return STOP;

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
      } catch (error) {
        if (cancelled) return STOP;
        const status = getErrorStatus(error);
        if (status === 409) {
          pendingRequestRef.current = null;
          setState('taken-over');
          return STOP;
        }
        // 출력대가 지워졌거나(404) 권한이 없으면(403) 다시 물어도 풀리지 않아 멈추고 알린다
        if (status === 404 || status === 403) {
          pendingRequestRef.current = null;
          setState(status === 404 ? 'not-found' : 'forbidden');
          return STOP;
        }
        // 응답을 못 받았으면 requestId 를 그대로 두고 다시 묻는다
        if (status !== undefined) pendingRequestRef.current = null;
        throw error;
      }

      if (cancelled) return STOP;
      if (!job) return POLL_INTERVAL_MS;

      // 인쇄 전에 먼저 남겨, 이 뒤에 화면이 닫혀도 다시 열 때 보고할 수 있게 한다
      const base: PendingReport = {
        jobId: job.jobId,
        claimToken: job.claimToken,
        printCalled: false,
        name: job.name,
        school: job.school,
      };
      savePendingReport(stationId, base);
      setCurrent(job);

      let outcome: BadgePrintOutcome = 'SUBMITTED';
      let reason: string | undefined;
      try {
        await printBadgeInFrame(job, () =>
          savePendingReport(stationId, { ...base, printCalled: true }),
        );
      } catch (error) {
        // print() 를 부르기 전 실패만 재시도 대상이다. 그 밖은 종이가 나왔을 수 있어 인쇄 요청으로 본다
        if (error instanceof BeforePrintError) {
          outcome = 'FAILED_BEFORE_PRINT';
          reason = error.message.slice(0, 200);
        }
      }
      savePendingReport(stationId, {
        ...base,
        printCalled: outcome === 'SUBMITTED',
        outcome,
        reason,
      });
      setCurrent(null);

      return (await settlePending())
        ? NEXT_JOB_DELAY_MS
        : retryDelay(reportFailures, lastStatus);
    };

    const tick = async () => {
      if (cancelled) return;
      let next = RETRY_BASE_MS;
      try {
        next = await step();
        errorCount = 0;
        if (reportFailures === 0) setLastError(null);
        if (next !== STOP) setState('running');
      } catch (error) {
        errorCount += 1;
        next = retryDelay(errorCount, getErrorStatus(error));
        setLastError(messageOf(error, '출력 작업을 받지 못했습니다.'));
        if (errorCount >= ERROR_ALERT_COUNT) setState('error');
      } finally {
        setCurrent(null);
        if (next !== STOP) schedule(next, tick);
      }
    };

    const open = async () => {
      if (cancelled) return;
      setState('connecting');
      try {
        const sessionId = await openBadgePrintSession(expoId, stationId);
        if (cancelled) return;
        sessionRef.current = sessionId;
        pendingRequestRef.current = null;
        errorCount = 0;
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
        errorCount += 1;
        setState('error');
        setLastError(messageOf(error, '출력대를 열지 못했습니다.'));
        schedule(retryDelay(errorCount, status), open);
      }
    };

    // 같은 브라우저에서 같은 출력대를 두 탭이 돌리면 두 탭이 같은 보고 기록을 함께 읽는다. 한 탭만 돌게 한다
    if (typeof navigator !== 'undefined' && navigator.locks) {
      let granted = false;
      const notice = window.setTimeout(() => {
        if (!granted && !cancelled) setState('other-tab');
      }, OTHER_TAB_NOTICE_MS);
      navigator.locks
        .request(
          `badge-print-station:${stationId}`,
          { signal: lockAbort.signal },
          () => {
            granted = true;
            window.clearTimeout(notice);
            if (cancelled) return undefined;
            void open();
            return new Promise<void>((resolve) => {
              releaseLock = resolve;
            });
          },
        )
        .catch(() => undefined);
    } else {
      // 탭끼리 막을 수 없으면 두 탭이 같은 보고 기록을 덮어쓸 수 있어 실행하지 않는다(현장 Chrome 은 지원)
      setState('unsupported');
    }

    return () => {
      cancelled = true;
      timer.dispose();
      lockAbort.abort();
      releaseLock?.();
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
      setLastError(messageOf(error, '출력대 상태를 바꾸지 못했습니다.'));
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
