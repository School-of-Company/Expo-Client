'use client';

import { useQuery } from '@tanstack/react-query';
import { getPreRegisterCapacity } from '../api/preRegister';

/**
 * 회차 잔여석(안내용). 조회에 실패하면 잔여석을 알 수 없으므로 화면이 알리고 신청을 막는다.
 * 조회 실패를 삼킨 채 신청을 진행시키면 정원이 찬 회차에 신청해 일행 전체가 거절된다.
 */
export const usePreRegisterCapacity = (expoId: string, sessionId: string) =>
  useQuery({
    queryKey: ['preRegisterCapacity', expoId, sessionId],
    queryFn: () => getPreRegisterCapacity(expoId, sessionId),
    retry: false,
    // 회차 없이 들어온 링크는 화면이 회차 선택을 안내하므로 조회하지 않는다
    enabled: !!sessionId,
  });
