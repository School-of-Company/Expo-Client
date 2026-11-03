import type { BadgePrintOutcome } from '../api/badgePrintApi';

/**
 * 받은 작업의 결과를 서버에 보고하기 전까지 남겨 두는 기록. 화면이 닫히거나 새로고침돼도 다시 열 때 보고해,
 * 서버가 결과 모름(확인 필요)으로 닫아 명찰이 누락되지 않게 한다(#929).
 * printCalled 가 false 면 인쇄를 부르지 않은 것이 확실해 서버가 자동으로 다시 출력해도 중복이 아니다
 */
export interface PendingReport {
  jobId: number;
  claimToken: string;
  printCalled: boolean;
  // 인쇄를 마친 뒤 정한 결과. 없으면 printCalled 로 정한다
  outcome?: BadgePrintOutcome;
  reason?: string;
  // 최근 출력 목록 표시용
  name: string;
  school: string | null;
}

const storageKey = (stationId: string) => `badge-print:pending:${stationId}`;

// 시크릿 창·저장소 차단에서도 출력은 계속되도록 저장 실패는 무시한다
export const loadPendingReport = (stationId: string): PendingReport | null => {
  try {
    const raw = window.localStorage.getItem(storageKey(stationId));
    return raw ? (JSON.parse(raw) as PendingReport) : null;
  } catch {
    return null;
  }
};

export const savePendingReport = (stationId: string, report: PendingReport) => {
  try {
    window.localStorage.setItem(storageKey(stationId), JSON.stringify(report));
  } catch {
    // 저장하지 못하면 화면이 닫힐 때 기존처럼 서버가 확인 필요로 돌린다
  }
};

export const clearPendingReport = (stationId: string) => {
  try {
    window.localStorage.removeItem(storageKey(stationId));
  } catch {
    // 무시
  }
};

export const outcomeOf = (report: PendingReport): BadgePrintOutcome =>
  report.outcome ?? (report.printCalled ? 'SUBMITTED' : 'FAILED_BEFORE_PRINT');
