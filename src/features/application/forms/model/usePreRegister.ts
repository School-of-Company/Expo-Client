'use client';

import { useQuery } from '@tanstack/react-query';
import { getPreRegisterSession } from '../api/preRegister';

/** 회차 정보. 회차 API가 아직 없어 실패해도 신청은 막지 않도록 조용히 둔다. */
export const usePreRegisterSession = (expoId: string, sessionId: string) =>
  useQuery({
    queryKey: ['preRegisterSession', expoId, sessionId],
    queryFn: () => getPreRegisterSession(expoId, sessionId),
    retry: false,
    meta: { silent: true },
  });
