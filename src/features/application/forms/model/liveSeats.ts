import type { ProgramType } from '@/shared/types/program/list/type';

/** 카드에 보일 회차 하나의 숫자. 모르는 값은 null 이다 */
export interface SeatNumbers {
  capacity: number | null;
  confirmed: number | null;
  remaining: number | null;
  waitingCapacity: number | null;
  waiting: number;
  waitingRemaining: number;
  /** 지금 새 대기 신청을 받는지 */
  waitingOpen: boolean;
  /** 대상별 정원 회차만. 교사·예비교사는 남았는지만 알고 숫자는 모른다 */
  target?: { teacherAvailable: boolean; otherRemaining: number };
}

/** seats 가 null 이면 이 회차만 조회에 실패한 것이다("확인 불가") */
export interface SeatEntry {
  id: number;
  /** 신청 기간 종료 또는 관리자 마감 */
  closed: boolean;
  seats: SeatNumbers | null;
}

/**
 * unsupported: 공개 정원 요약 API 가 아직 배포·공개되지 않았다(404·401·403). 숫자 없이 둔다.
 * error: 조회에 실패했다
 */
export interface SeatGroup {
  status: 'ok' | 'unsupported' | 'error';
  sessions: SeatEntry[];
}

/** 현황 API(`/api/public/expos/{expoId}/seats`) 응답 */
export interface LiveSeats {
  fetchedAt: string;
  preRegister: SeatGroup;
  programs: Record<ProgramType, SeatGroup>;
}

/** Application `GET .../preregister-sessions/{sessionId}/capacity` 중 쓰는 필드 */
export interface PreRegisterCapacityWire {
  remaining: number | null;
  confirmed?: number | null;
  waiting?: number;
  appliedWaitingCapacity?: number | null;
  waitingRemaining?: number;
  maxWaitingApplicants?: number;
  targetSeats?: {
    teacherAvailable: boolean;
    nonTeacherRemaining: number;
  } | null;
}

interface ProgramCapacityWire {
  capacity: number;
  confirmedCount: number;
  remaining: number;
  waitingCapacity: number;
  waitingCount: number;
  waitingRemaining: number;
}

/** Application `GET .../program-sessions/{programType}/seats` 의 회차 하나 */
export interface ProgramSeatsWire {
  programId: number;
  closed: boolean;
  capacity: ProgramCapacityWire;
  /** 사전·현장 정원이 나뉜 회차만 */
  admissionSeats?: { preRegistration: ProgramCapacityWire } | null;
}

// 응답 모양이 어긋나면 NaN 을 화면에 보이지 않고 그 회차를 확인 불가로 돌린다
const int = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value))
    throw new Error('정원 응답 형식이 올바르지 않습니다.');
  return value;
};

/**
 * 사전등록 잔여석 응답을 카드 숫자로 바꾼다. 서버는 정원을 주지 않는다.
 * 마감이거나 대기열이 있으면 remaining 이 0 으로 눌려 정원을 알 수 없으므로 그때는 null 이다
 */
export const fromPreRegisterCapacity = (
  c: PreRegisterCapacityWire,
  closed: boolean,
): SeatNumbers => {
  const waiting = int(c.waiting ?? 0);
  const base = {
    waitingCapacity: c.appliedWaitingCapacity ?? null,
    waiting,
    waitingRemaining: int(c.waitingRemaining ?? 0),
    waitingOpen: int(c.maxWaitingApplicants ?? 0) > 0,
  };
  if (c.targetSeats)
    return {
      capacity: null,
      confirmed: null,
      remaining: null,
      ...base,
      target: {
        teacherAvailable: !!c.targetSeats.teacherAvailable,
        otherRemaining: int(c.targetSeats.nonTeacherRemaining),
      },
    };
  const confirmed = c.confirmed == null ? null : int(c.confirmed);
  const remaining = int(c.remaining);
  return {
    capacity:
      !closed && waiting === 0 && confirmed !== null
        ? confirmed + remaining
        : null,
    confirmed,
    remaining,
    ...base,
  };
};

/** 프로그램·연수 회차 정원 요약을 카드 숫자로 바꾼다. 사전·현장 정원이 나뉜 회차는 사전 숫자를 쓴다 */
export const fromProgramSeats = (item: ProgramSeatsWire): SeatEntry => {
  const pre = item.admissionSeats?.preRegistration ?? item.capacity;
  const waitingRemaining = int(item.capacity.waitingRemaining);
  return {
    id: int(item.programId),
    closed: !!item.closed,
    seats: {
      capacity: int(pre.capacity),
      confirmed: int(pre.confirmedCount),
      remaining: int(pre.remaining),
      waitingCapacity: int(item.capacity.waitingCapacity),
      waiting: int(item.capacity.waitingCount),
      waitingRemaining,
      waitingOpen: waitingRemaining > 0,
    },
  };
};

export type SeatStatus =
  | 'OPEN'
  | 'WAITING_OPEN'
  | 'FULL'
  | 'CLOSED'
  | 'UNKNOWN';

export const SEAT_STATUS_LABEL: Record<SeatStatus, string> = {
  OPEN: '신청 가능',
  WAITING_OPEN: '대기 신청 가능',
  FULL: '정원 마감',
  CLOSED: '신청 기간 종료 또는 관리자 마감',
  UNKNOWN: '확인 불가',
};

/** 화면 안내용 상태. 최종 판정은 신청할 때 서버가 한다 */
export const getSeatStatus = ({ closed, seats }: SeatEntry): SeatStatus => {
  if (closed) return 'CLOSED';
  if (!seats) return 'UNKNOWN';
  const open = seats.target
    ? seats.target.teacherAvailable || seats.target.otherRemaining > 0
    : (seats.remaining ?? 0) > 0;
  if (open) return 'OPEN';
  return seats.waitingOpen ? 'WAITING_OPEN' : 'FULL';
};

/** 카드에 줄로 보일 정원·현황. 교사 쪽은 숫자 없이 잔여 있음/마감만 말한다 */
export const getSeatSummary = (seats: SeatNumbers): string[] => {
  const n = (value: number) => value.toLocaleString();
  // 대기를 받지 않는 회차(대기 정원 0)에는 대기 줄을 보이지 않는다
  const hasWaiting = (seats.waitingCapacity ?? 0) > 0 || seats.waiting > 0;
  const capacity = [
    seats.capacity !== null && `정원 ${n(seats.capacity)}명`,
    hasWaiting &&
      seats.waitingCapacity !== null &&
      `대기 정원 ${n(seats.waitingCapacity)}명`,
  ].filter(Boolean);
  const current = [
    seats.confirmed !== null && `확정 ${n(seats.confirmed)}명`,
    hasWaiting && `대기 ${n(seats.waiting)}명`,
    seats.remaining !== null && `잔여 ${n(seats.remaining)}석`,
    seats.target &&
      `교사·예비교사 ${seats.target.teacherAvailable ? '잔여 있음' : '마감'}`,
    seats.target && `그 외 잔여 ${n(seats.target.otherRemaining)}석`,
  ].filter(Boolean);
  return [capacity.join(' · '), current.join(' · ')].filter(Boolean);
};

/** 실패한 부분이 있으면 CDN 에 캐시하지 않는다. 닫힌 회차의 숫자는 조회하지 않으므로 실패로 보지 않는다 */
export const isCacheable = ({ preRegister, programs }: LiveSeats) =>
  [preRegister, programs.STANDARD, programs.TRAINING].every(
    (group) =>
      group.status !== 'error' &&
      group.sessions.every((entry) => entry.closed || entry.seats),
  );

export const getAgoLabel = (fetchedAt: number, now: number) => {
  const seconds = Math.max(0, Math.floor((now - fetchedAt) / 1000));
  return seconds < 60
    ? `${seconds}초 전 갱신`
    : `${Math.floor(seconds / 60)}분 전 갱신`;
};
