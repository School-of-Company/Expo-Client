'use client';

import { useQuery } from '@tanstack/react-query';
import { getLiveSeats } from '../api/liveSeats';

/** 한 화면의 모든 카드가 이 조회 하나를 같이 쓴다. 안내용이라 실패해도 화면은 막지 않는다 */
export const useLiveSeats = (expoId: string) =>
  useQuery({
    queryKey: ['liveSeats', expoId],
    queryFn: () => getLiveSeats(expoId),
    refetchInterval: 10_000,
    // 탭이 보이지 않으면 멈추고, 돌아오면 바로 다시 받는다
    refetchIntervalInBackground: false,
    retry: false,
    meta: { silent: true },
  });
