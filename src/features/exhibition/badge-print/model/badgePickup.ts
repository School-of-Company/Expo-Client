import type { BadgePrintJobStatusResponse } from '../api/badgePrintApi';

export type BadgePickup =
  | { kind: 'assigning' }
  | { kind: 'assigned'; label: string }
  | { kind: 'needsCheck' }
  | { kind: 'error' };

// 점유한 출력대가 있을 때만 번호를 보여 준다. SUBMITTED 도 인쇄 요청일 뿐이라 '출력 완료'로 쓰지 않는다
export const toBadgePickup = (
  data: BadgePrintJobStatusResponse | undefined,
  isError: boolean,
): BadgePickup => {
  if (isError) return { kind: 'error' };
  if (data?.status === 'FAILED' || data?.status === 'NEEDS_CHECK')
    return { kind: 'needsCheck' };
  if (data?.station) return { kind: 'assigned', label: data.station.label };
  return { kind: 'assigning' };
};

export const isBadgePickupSettled = (
  data: BadgePrintJobStatusResponse | undefined,
) =>
  !!data &&
  (data.status === 'FAILED' || data.status === 'NEEDS_CHECK' || !!data.station);
