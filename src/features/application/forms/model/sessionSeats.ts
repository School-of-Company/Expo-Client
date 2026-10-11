import type { PreRegisterSession } from '../api/preRegister';

/**
 * 회차의 남은 자리. 정원이 찬 뒤에는 대기 자리를 쓴다.
 * 동행자도 각자 정원 1을 쓰므로 대표자를 포함한 인원이 이 수를 넘을 수 없다.
 */
export const getRemainingSeats = (session: PreRegisterSession): number => {
  const remaining = session.capacity - session.confirmedCount;
  if (remaining > 0) return remaining;
  return Math.max(0, session.waitingCapacity - session.waitingCount);
};

/** 대표자를 제외하고 추가할 수 있는 동행자 수. */
export const getCompanionLimit = (session: PreRegisterSession): number =>
  Math.max(0, getRemainingSeats(session) - 1);

export const getSessionStatus = (session: PreRegisterSession) => {
  const remaining = session.capacity - session.confirmedCount;
  const waitingRemaining = session.waitingCapacity - session.waitingCount;

  if (remaining > 0)
    return {
      canApply: true,
      label: `현재 신청 가능 · 잔여 ${remaining.toLocaleString()}명`,
    };
  if (waitingRemaining > 0)
    return {
      canApply: true,
      label: `정원 마감 · 대기 신청 가능 · 대기 잔여 ${waitingRemaining.toLocaleString()}명`,
    };
  return { canApply: false, label: '신청 마감' };
};
