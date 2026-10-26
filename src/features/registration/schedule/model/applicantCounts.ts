import type { ScheduleProgram } from '../../common';
import type { AdminSessionSummary } from '../../common/api/ledgerApi';

export interface ApplicantCounts {
  confirmed: number;
  waiting: number;
}

/**
 * 프로그램·연수 회차의 현재 신청 인원(확정·대기). 신청 요약(회차별 statusCounts)에서 읽는다.
 * 요약을 못 읽었거나(undefined), 요약에 회차가 없는데 요약이 전체 회차를 담지 못했으면(totalSessions 가 더 큼)
 * 0 으로 단정하지 않고 undefined 를 돌려 화면이 '-' 로 보이게 한다
 */
export const getApplicantCounts = (
  program: Pick<ScheduleProgram, 'id' | 'programType'>,
  summary:
    | Pick<
        { sessions: AdminSessionSummary[]; totalSessions: number },
        'sessions' | 'totalSessions'
      >
    | undefined,
): ApplicantCounts | undefined => {
  if (!summary) return undefined;
  const found = summary.sessions.find(
    (item) =>
      item.programId === program.id && item.programType === program.programType,
  );
  if (!found && summary.totalSessions > summary.sessions.length)
    return undefined;
  return {
    confirmed: found?.statusCounts.CONFIRMED ?? 0,
    waiting: found?.statusCounts.WAITING ?? 0,
  };
};
