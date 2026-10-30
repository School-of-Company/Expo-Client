'use client';

import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { getBadgePrintJobStatus } from '../api/badgePrintApi';
import {
  BadgePickup,
  isBadgePickupSettled,
  toBadgePickup,
} from './badgePickup';

const PICKUP_POLL_MS = 2000;
// 이 시간 안에 배정되지 않으면 조회를 멈추고 직접 확인하게 한다
const PICKUP_GIVE_UP_MS = 60_000;

/**
 * 입장 결과 카드의 명찰 수령 안내. 작업(jobId)마다 쿼리가 따로라 다음 스캔·퇴장·화면 이탈로
 * 카드가 바뀌면 이전 요청은 취소되고 결과도 새 카드에 섞이지 않는다
 */
export const useBadgePickup = (
  expoId: string,
  jobId: number,
): BadgePickup & { gaveUp: boolean } => {
  const startedAt = useRef(Date.now());
  const { data, isError } = useQuery({
    queryKey: ['badgePickup', expoId, jobId],
    queryFn: ({ signal }) => getBadgePrintJobStatus(expoId, jobId, signal),
    refetchInterval: (query) =>
      isBadgePickupSettled(query.state.data) ||
      Date.now() - startedAt.current > PICKUP_GIVE_UP_MS
        ? false
        : PICKUP_POLL_MS,
    retry: 1,
    gcTime: 0,
    meta: { silent: true },
  });
  const pickup = toBadgePickup(data, isError);
  return {
    ...pickup,
    gaveUp:
      pickup.kind === 'assigning' &&
      Date.now() - startedAt.current > PICKUP_GIVE_UP_MS,
  };
};
