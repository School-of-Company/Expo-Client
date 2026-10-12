'use client';

import { useQuery } from '@tanstack/react-query';
import { getPreRegisterSession } from '../api/preRegister';

/**
 * 회차 정보. 조회에 실패하면 잔여석·마감을 알 수 없으므로 화면이 알리고 신청을 막는다.
 * 조회 실패를 삼킨 채 신청을 진행시키면 정원이 찬 회차에 신청해 일행 전체가 거절된다.
 */
export const usePreRegisterSession = (expoId: string, sessionId: string) =>
  useQuery({
    queryKey: ['preRegisterSession', expoId, sessionId],
    queryFn: () => getPreRegisterSession(expoId, sessionId),
    retry: false,
  });
