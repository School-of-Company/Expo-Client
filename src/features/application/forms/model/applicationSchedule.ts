import type { FormPeriodStatus } from './formPeriodStatus';
import type { PublicPreregisterSession } from '../api/preRegister';
import type { Program } from '@/shared/types/program/list/type';

/**
 * 신청 가능 일정 화면의 회차 상태. 안내용이며 실제 신청 가능 여부는 신청할 때 서버가 판정한다.
 * 접수 전은 좌석 마감과 다르다. 정원이 찼는지는 이 화면에서 알 수 없다.
 */
export type ScheduleStatus = 'UPCOMING' | 'OPEN' | 'CLOSED' | 'ENDED' | 'UNSET';

export const SCHEDULE_STATUS_LABEL: Record<ScheduleStatus, string> = {
  UPCOMING: '접수 전',
  OPEN: '접수 중',
  CLOSED: '접수 마감',
  ENDED: '종료',
  UNSET: '모집 준비 중',
};

const time = (value: string | null | undefined) =>
  value ? new Date(value).getTime() : NaN;

/**
 * 일반 사전등록 회차 상태. 접수 기간은 사전등록 신청서(폼) 기간이고, 회차마다 운영 마감·종료가 따로 있다.
 * 신청서가 아직 없으면 접수 시작을 알 수 없으므로 모집 준비 중이다.
 */
export const getPreRegisterScheduleStatus = (
  formStatus: FormPeriodStatus | null,
  session: Pick<PublicPreregisterSession, 'closed' | 'endedAt'>,
  now: number,
): ScheduleStatus => {
  if (time(session.endedAt) < now) return 'ENDED';
  if (session.closed) return 'CLOSED';
  if (!formStatus) return 'UNSET';
  if (formStatus === 'UPCOMING') return 'UPCOMING';
  if (formStatus === 'CLOSED') return 'CLOSED';
  return 'OPEN';
};

/**
 * 프로그램·연수 회차 상태. 사전 접수 기간(policy.applicationStartedAt~EndedAt) 기준이다.
 * 현장 접수는 행사 당일 현장 등록에서 안내하므로 여기서는 다루지 않는다.
 */
export const getProgramScheduleStatus = (
  program: Pick<Program, 'policy' | 'endedAt'>,
  now: number,
): ScheduleStatus => {
  const { policy } = program;
  if (time(program.endedAt) < now) return 'ENDED';
  if (!policy) return 'UNSET';
  if (policy.closed) return 'CLOSED';
  if (now < time(policy.applicationStartedAt)) return 'UPCOMING';
  if (now >= time(policy.applicationEndedAt)) return 'CLOSED';
  return 'OPEN';
};

/**
 * 공개 화면에 보일 프로그램·연수 회차 정원. 관리자가 설정한 정원(policy.capacity)이라 신청 시작 전에도 보인다.
 * 교사·예비교사에게 숨기는 숫자는 사전등록의 신청 인원·잔여석이며(#643), 설정 정원과 다르다(#748).
 * 정책이 없거나 값이 올바르지 않으면 보이지 않는다
 */
export const getProgramCapacity = (
  program: Pick<Program, 'policy'>,
): number | undefined => {
  const capacity = program.policy?.capacity;
  return Number.isInteger(capacity) && capacity! > 0 ? capacity : undefined;
};

/** 분류 카드의 정원 문구. 회차가 여럿이면 회차당 정원이고, 회차마다 다르면 범위로 보인다 */
export const formatCapacity = (
  capacities: (number | undefined)[],
): string | null => {
  const values = capacities.filter(
    (value): value is number => value !== undefined,
  );
  if (values.length === 0) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range =
    min === max
      ? min.toLocaleString()
      : `${min.toLocaleString()}~${max.toLocaleString()}`;
  return `${capacities.length > 1 ? '회차당 정원' : '정원'} ${range}명`;
};

/** 켜둔 화면이 접수 시작·마감·회차 종료 시각에 상태를 바꾸도록 쓰는 경계 시각들 */
export const getScheduleBoundaries = (
  programs: Pick<Program, 'policy' | 'endedAt'>[],
  sessions: Pick<PublicPreregisterSession, 'endedAt'>[],
  form: { startDate: string; endDate: string } | null,
): number[] =>
  [
    ...programs.flatMap(({ policy, endedAt }) => [
      time(policy?.applicationStartedAt),
      time(policy?.applicationEndedAt),
      time(endedAt),
    ]),
    ...sessions.map(({ endedAt }) => time(endedAt)),
    time(form?.startDate),
    time(form?.endDate),
  ].filter(Number.isFinite);
