import { getPreRegisterSessionState } from './usePreRegister';
import type { OwnerApplication, OwnerParticipant } from '../api/myApplications';
import type { PublicPreregisterSession } from '../api/preRegister';

const STUDENT_OCCUPATIONS = new Set([
  'KINDERGARTEN_STUDENT',
  'ELEMENTARY_STUDENT',
  'MIDDLE_SCHOOL_STUDENT',
  'HIGH_SCHOOL_STUDENT',
]);

/** 학생만 남으면 서버가 400 으로 거절한다(Q1). 직업을 모르는 참석자는 학생으로 보지 않는다 */
export const hasOnlyStudents = (
  participants: Pick<OwnerParticipant, 'participantId' | 'occupation'>[],
  selectedIds: number[],
) => {
  const selected = participants.filter(({ participantId }) =>
    selectedIds.includes(participantId),
  );
  return (
    selected.length > 0 &&
    selected.every(
      ({ occupation }) => occupation && STUDENT_OCCUPATIONS.has(occupation),
    )
  );
};

const toTime = (value: string) => new Date(value.replace(' ', 'T')).getTime();

/** [시작, 끝) 기준으로 일부라도 겹치는지. 입장 허용 여유(leadMinutes)는 넣지 않는다 */
const overlaps = (
  a: Pick<PublicPreregisterSession, 'startedAt' | 'endedAt'>,
  b: Pick<PublicPreregisterSession, 'startedAt' | 'endedAt'>,
) =>
  toTime(a.startedAt) < toTime(b.endedAt) &&
  toTime(b.startedAt) < toTime(a.endedAt);

export type SessionBlockReason =
  | 'APPLIED'
  | 'OVERLAP'
  | 'CLOSED'
  | 'ENDED'
  | null;

export const SESSION_BLOCK_LABEL: Record<
  Exclude<SessionBlockReason, null>,
  string
> = {
  APPLIED: '이미 신청한 회차',
  OVERLAP: '신청한 회차와 시간이 겹침',
  CLOSED: '접수 마감',
  ENDED: '종료',
};

/**
 * 회차를 고를 수 없는 이유. 안내용이며 정원·기간·시간 겹침의 최종 판정은 서버가 한다.
 * 이미 신청한(확정·대기) 회차와 확정 회차끼리 시간이 겹치는 회차는 막는다
 */
export const getSessionBlockReason = (
  session: PublicPreregisterSession,
  sessions: PublicPreregisterSession[],
  applications: Pick<
    OwnerApplication,
    'type' | 'status' | 'sessionOrProgramId'
  >[],
  now: Date = new Date(),
): SessionBlockReason => {
  const mine = applications.filter(({ type }) => type === 'PREREGISTER');
  if (
    mine.some(
      ({ status, sessionOrProgramId }) =>
        sessionOrProgramId === session.id &&
        (status === 'CONFIRMED' || status === 'WAITING'),
    )
  )
    return 'APPLIED';

  const state = getPreRegisterSessionState(session, now);
  if (state !== 'OPEN') return state;

  const confirmed = sessions.filter(({ id }) =>
    mine.some(
      ({ status, sessionOrProgramId }) =>
        status === 'CONFIRMED' && sessionOrProgramId === id,
    ),
  );
  return confirmed.some((other) => overlaps(session, other)) ? 'OVERLAP' : null;
};
