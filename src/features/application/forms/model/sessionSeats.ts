import type { PreRegisterCapacity } from '../api/preRegister';

/** 대표자를 포함한 1회 신청 최대 인원. 서버 한도는 5명이다. */
const PARTY_MAX = 5;

/**
 * 일행 전체가 확정으로 접수되는 최대 인원. 남은 자리와 확정 1회 최대 인원 중 작은 쪽.
 * 대상별 정원 회차는 교사 숫자를 모르므로 교사 자리가 있으면 5명, 그 외는 그 외 정원 기준으로 본다.
 * 일행 구성에 따른 실제 판정은 제출할 때 서버가 한다
 */
export const getConfirmedLimit = (c: PreRegisterCapacity): number => {
  const t = c.targetSeats;
  if (t) {
    const other = Math.min(t.nonTeacherRemaining, t.nonTeacherMaxApplicants);
    return Math.max(
      0,
      Math.min(Math.max(t.teacherAvailable ? PARTY_MAX : 0, other), PARTY_MAX),
    );
  }
  return Math.max(
    0,
    Math.min(c.remaining ?? 0, c.maxApplicants ?? 0, PARTY_MAX),
  );
};

/** 확정이 모자랄 때 일행 전체가 대기로 접수되는 최대 인원. */
export const getWaitingLimit = (c: PreRegisterCapacity): number =>
  c.targetSeats
    ? 0 // 대상별 정원 회차는 대기를 받지 않는다
    : Math.max(0, Math.min(c.maxWaitingApplicants ?? 0, PARTY_MAX));

/** 대표자를 포함해 이번에 신청할 수 있는 최대 인원. 확정과 대기 중 큰 쪽. */
export const getApplicantLimit = (c: PreRegisterCapacity): number =>
  Math.max(getConfirmedLimit(c), getWaitingLimit(c));

/** 대표자를 제외하고 추가할 수 있는 동행자 수. */
export const getCompanionLimit = (c: PreRegisterCapacity): number =>
  Math.max(0, getApplicantLimit(c) - 1);

/** 이 인원으로 제출하면 일행 전체가 대기로 접수되는가. 한 일행은 나뉘지 않는다. */
export const isWaitingParty = (
  c: PreRegisterCapacity,
  partySize: number,
): boolean =>
  partySize > getConfirmedLimit(c) && partySize <= getWaitingLimit(c);
