import {
  AdminSessionSummary,
  ProgramSessionDefinition,
  ProgramSessionType,
} from '../../common/api/ledgerApi';
import { toSessionKey } from '../../common/model/ledger';

/** 서버 groupId 가 같은 회차를 묶은 프로그램. groupId 가 없는 회차는 회차 하나가 한 묶음이다 */
export interface ProgramGroup {
  id: string;
  programType: ProgramSessionType;
  /** 묶음명 계약이 없어 속한 회차 제목을 나열한다 */
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
 * 서버 groupId 로 묶고 제목은 식별에 쓰지 않는다. 구분(programType)이 다르면 같은 groupId 라도
 * 나누고, groupId 가 없으면 구분 + 회차 ID 로 개별 표시한다. 건수는 회차별 합이라 고유 참가자 수가 아니다
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
  const groups = new Map<
    string,
    ProgramGroup & { startedAt: string; titles: string[] }
  >();

  sessions.forEach((session) => {
    const id = session.groupId
      ? `${session.programType}:group:${session.groupId}`
      : `${session.programType}:session:${session.id}`;
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
      titles: [],
    };
    const counts = summaryByKey.get(toSessionKey(session))?.statusCounts;
    groups.set(id, {
      ...group,
      title: [...group.titles, session.title]
        .filter((title, i, all) => all.indexOf(title) === i)
        .join(', '),
      titles: [...group.titles, session.title],
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
    .map(({ startedAt: _startedAt, titles: _titles, ...group }) => group);
};

/** 신청을 받는 회차. 정책이 없으면 열림 여부를 알 수 없어 세지 않는다 */
export const countOpenSessions = (sessions: ProgramSessionDefinition[]) =>
  sessions.filter(({ policy }) => policy && !policy.closed).length;
