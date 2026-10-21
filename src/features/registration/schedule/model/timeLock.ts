import { ScheduleProgram } from '../../common';
import { AdminSessionSummary } from '../../common/api/ledgerApi';
import { AdminPreregisterSessionSummary } from '../../common/api/preregisterSummaryApi';

export const TIME_LOCK_NOTICE = '신청 이력이 있어 시간은 바꿀 수 없습니다.';

/**
 * 사전등록 회차의 시간(시작·종료·취소 마감) 잠금. 서버는 취소 이력만 있어도 잠그므로 취소 인원도 센다.
 * 집계를 못 읽었으면(undefined) 잠그지 않고 서버 409 사유로 안내한다
 */
export const isPreregisterTimeLocked = (
  summary: AdminPreregisterSessionSummary | undefined,
) =>
  !!summary &&
  summary.confirmedParticipants +
    summary.cancelledParticipants +
    summary.waitingParticipants +
    summary.pendingReservations >
    0;

/** 프로그램 회차의 시작·종료 잠금. 서버는 확정 또는 활성(대기 포함) 인원이 있을 때만 잠근다 */
export const isProgramTimeLocked = (
  program: Pick<ScheduleProgram, 'id' | 'programType'>,
  sessions: AdminSessionSummary[] | undefined,
) => {
  const counts = sessions?.find(
    (item) =>
      item.programId === program.id && item.programType === program.programType,
  )?.statusCounts;
  return (counts?.CONFIRMED ?? 0) + (counts?.WAITING ?? 0) > 0;
};
