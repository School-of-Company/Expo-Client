import type { PreRegisterCapacity } from '../api/preRegister';

/** 대표자를 포함해 이번에 신청할 수 있는 최대 인원. 남은 자리와 1회 최대 인원 중 작은 쪽. */
export const getApplicantLimit = (c: PreRegisterCapacity): number =>
  Math.max(0, Math.min(c.remaining, c.maxApplicants));

/** 대표자를 제외하고 추가할 수 있는 동행자 수. */
export const getCompanionLimit = (c: PreRegisterCapacity): number =>
  Math.max(0, getApplicantLimit(c) - 1);
