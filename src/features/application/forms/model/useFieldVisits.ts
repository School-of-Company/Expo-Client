'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSessionIssue } from '@/features/phone-verification';
import {
  getFieldVisitParty,
  registerFieldVisits,
  type RegisterFieldVisitBody,
} from '../api/fieldVisits';

export const fieldVisitsKey = (expoId: string) => ['fieldVisits', expoId];

/**
 * 인증한 번호의 기존 일행과 오늘 방문일 등록 상태. 조회 실패를 미등록으로 보지 않도록
 * 호출부는 isError 일 때 신규 폼 대신 오류와 재시도를 보여야 한다
 */
export const useFieldVisitParty = (expoId: string, enabled: boolean) => {
  const query = useQuery({
    queryKey: fieldVisitsKey(expoId),
    queryFn: () => getFieldVisitParty(expoId),
    enabled,
    retry: false,
    // 응답은 no-store 이고 등록·취소로 곧 바뀌므로 캐시를 오래 쓰지 않는다
    staleTime: 0,
    gcTime: 0,
    meta: { silent: true },
  });
  return {
    party: query.data,
    isLoading: enabled && query.isPending,
    isFetching: query.isFetching,
    errorMessage:
      query.error && !getSessionIssue(query.error)
        ? query.error.message
        : undefined,
    sessionIssue: getSessionIssue(query.error),
    refetch: query.refetch,
  };
};

export const useRegisterFieldVisits = (expoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (target: {
      body: RegisterFieldVisitBody;
      idempotencyKey: string;
      csrfToken?: string;
    }) =>
      registerFieldVisits(
        expoId,
        target.body,
        target.idempotencyKey,
        target.csrfToken,
      ),
    // 성공·실패 모두 다른 화면에서 처리됐을 수 있어 다시 받는다(새 CSRF 토큰 포함)
    onSettled: () =>
      Promise.all(
        [
          fieldVisitsKey(expoId),
          ['myApplications', expoId],
          ['myPreRegisterWaitlist', expoId],
          ['participantQr', expoId],
          ['preRegisterCapacity', expoId],
          ['programParticipants', expoId],
        ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      ),
  });
};
