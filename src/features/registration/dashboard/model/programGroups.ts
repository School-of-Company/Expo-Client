import {
  AdminSessionSummary,
  ProgramSessionDefinition,
  ProgramSessionType,
} from '../../common/api/ledgerApi';
import { toSessionKey } from '../../common/model/ledger';

/** 같은 이름의 회차를 묶은 프로그램 */
export interface ProgramGroup {
  id: string;
  programType: ProgramSessionType;
  title: string;
  sessionCount: number;
  /** 정책이 없는 회차는 빼고 더한다 */
  capacity: number;
  waitingCapacity: number;
  /** 집계 조회가 실패하면 null */
  confirmed: number | null;
  waiting: number | null;
}

/**
 * 현재 회차는 프로그램 정의 하나가 회차 하나다. 프로그램 묶음 정보가 없어
 * 구분과 이름이 같은 회차를 한 프로그램으로 본다
 */
export const groupSessionsByProgram = (
  sessions: ProgramSessionDefinition[],
  summaries: AdminSessionSummary[] | null,
): ProgramGroup[] => {
  const summaryByKey = new Map(
    (summaries ?? []).map((summary) => [
      toSessionKey({ programType: summary.programType, id: summary.programId }),
      summary,
    ]),
  );
  const groups = new Map<string, ProgramGroup & { startedAt: string }>();

  sessions.forEach((session) => {
    const id = `${session.programType}:${session.title}`;
    const group = groups.get(id) ?? {
      id,
      programType: session.programType,
      title: session.title,
      sessionCount: 0,
      capacity: 0,
      waitingCapacity: 0,
      confirmed: summaries ? 0 : null,
      waiting: summaries ? 0 : null,
      startedAt: session.startedAt,
    };
    const counts = summaryByKey.get(toSessionKey(session))?.statusCounts;
    groups.set(id, {
      ...group,
      sessionCount: group.sessionCount + 1,
      capacity: group.capacity + (session.policy?.capacity ?? 0),
      waitingCapacity:
        group.waitingCapacity + (session.policy?.waitingCapacity ?? 0),
      confirmed:
        group.confirmed === null
          ? null
          : group.confirmed + (counts?.CONFIRMED ?? 0),
      waiting:
        group.waiting === null ? null : group.waiting + (counts?.WAITING ?? 0),
      startedAt:
        session.startedAt < group.startedAt
          ? session.startedAt
          : group.startedAt,
    });
  });

  // 일반 프로그램을 먼저, 같은 구분 안에서는 첫 회차가 빠른 순
  return Array.from(groups.values())
    .sort(
      (a, b) =>
        a.programType.localeCompare(b.programType) ||
        a.startedAt.localeCompare(b.startedAt),
    )
    .map(({ startedAt: _startedAt, ...group }) => group);
};

/** 신청을 받는 회차. 정책이 없으면 열림 여부를 알 수 없어 세지 않는다 */
export const countOpenSessions = (sessions: ProgramSessionDefinition[]) =>
  sessions.filter(({ policy }) => policy && !policy.closed).length;
