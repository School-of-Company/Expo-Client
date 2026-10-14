import type { PreRegisterCapacity } from '../api/preRegister';

/** 대표자를 포함한 1회 신청 최대 인원. 서버 한도는 5명이다. */
const PARTY_MAX = 5;

/** 일행 전체가 확정으로 접수되는 최대 인원. 남은 자리와 확정 1회 최대 인원 중 작은 쪽. */
export const getConfirmedLimit = (c: PreRegisterCapacity): number =>
  Math.max(0, Math.min(c.remaining, c.maxApplicants, PARTY_MAX));

/** 확정이 모자랄 때 일행 전체가 대기로 접수되는 최대 인원. */
export const getWaitingLimit = (c: PreRegisterCapacity): number =>
  Math.max(0, Math.min(c.maxWaitingApplicants ?? 0, PARTY_MAX));

/** 대표자를 포함해 이번에 신청할 수 있는 최대 인원. 확정과 대기 중 큰 쪽. */
export const getApplicantLimit = (c: PreRegisterCapacity): number =>
  Math.max(getConfirmedLimit(c), getWaitingLimit(c));

/** 대표자를 제외하고 추가할 수 있는 동행자 수. */
export const getCompanionLimit = (c: PreRegisterCapacity): number =>
  Math.max(0, getApplicantLimit(c) - 1);
