import type { ScheduleProgram } from '../../common';

export type ProgramStatusTone =
  | 'open'
  | 'upcoming'
  | 'closed'
  | 'muted'
  | 'warn';

export interface ProgramStatusLine {
  label: string;
  tone: ProgramStatusTone;
}

const time = (value: string | null | undefined) =>
  value ? new Date(value).getTime() : NaN;

/** 접수 기간 하나의 상태. 시작·종료가 없으면 그쪽 경계는 없는 것으로 본다 */
const getWindowStatus = (
  startedAt: string | null | undefined,
  endedAt: string | null | undefined,
  now: number,
): ProgramStatusLine => {
  if (now < time(startedAt)) return { label: '접수 전', tone: 'upcoming' };
  if (now >= time(endedAt)) return { label: '마감', tone: 'closed' };
  return { label: '모집 중', tone: 'open' };
};

/**
 * 관리자 회차 목록의 상태 줄. 변경 처리 중·정책 없음·명시적 마감(closed)이 기간보다 앞서고,
 * 그 밖에는 모집 시작·종료 시각으로 접수 전·모집 중·마감을 정한다.
 * 현장 접수 기간이 따로 있으면 사전과 현장을 한 줄씩 나누어 어느 채널의 상태인지 밝힌다
 * (현장 접수 기간이 없으면 사전 모집 기간 하나뿐이라 접두어 없이 한 줄이다)
 */
export const getProgramStatusLines = (
  program: Pick<ScheduleProgram, 'pendingRevision' | 'policy'>,
  now: number,
): ProgramStatusLine[] => {
  if (program.pendingRevision !== null)
    return [{ label: '변경 처리 중', tone: 'warn' }];
  const { policy } = program;
  if (!policy) return [{ label: '정책 없음', tone: 'muted' }];
  if (policy.closed) return [{ label: '마감', tone: 'closed' }];

  const preRegistration = getWindowStatus(
    policy.applicationStartedAt,
    policy.applicationEndedAt,
    now,
  );
  if (!policy.onsiteStartedAt || !policy.onsiteEndedAt)
    return [preRegistration];
  const onsite = getWindowStatus(
    policy.onsiteStartedAt,
    policy.onsiteEndedAt,
    now,
  );
  return [
    { ...preRegistration, label: `사전 ${preRegistration.label}` },
    { ...onsite, label: `현장 ${onsite.label}` },
  ];
};

/** 켜 둔 화면이 모집 시작·종료 시각에 상태를 바꾸도록 쓰는 경계 시각들 */
export const getProgramStatusBoundaries = (
  programs: Pick<ScheduleProgram, 'policy'>[],
): number[] =>
  programs
    .flatMap(({ policy }) => [
      time(policy?.applicationStartedAt),
      time(policy?.applicationEndedAt),
      time(policy?.onsiteStartedAt),
      time(policy?.onsiteEndedAt),
    ])
    .filter(Number.isFinite);
