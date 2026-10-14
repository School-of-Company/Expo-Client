import type { PreRegisterCapacity } from '../api/preRegister';

/** 확정석에 이어 대기석까지 받을 수 있는 자리. 서버가 일행 전원을 확정+대기로 받을 수 있을 때만 수락한다. */
export const getTotalSeats = (c: PreRegisterCapacity): number =>
  Math.max(0, c.remaining) + Math.max(0, c.waitingRemaining ?? 0);

/** 대표자를 포함해 이번에 신청할 수 있는 최대 인원. 확정+대기 자리와 1회 최대 인원 중 작은 쪽. */
export const getApplicantLimit = (c: PreRegisterCapacity): number =>
  Math.max(0, Math.min(getTotalSeats(c), c.maxApplicants));

/** 대표자를 제외하고 추가할 수 있는 동행자 수. */
export const getCompanionLimit = (c: PreRegisterCapacity): number =>
  Math.max(0, getApplicantLimit(c) - 1);
