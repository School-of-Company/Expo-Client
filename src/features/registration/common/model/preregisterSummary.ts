import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import {
  AdminPreregisterSessionSummary,
  getAdminPreregisterSummary,
} from '../api/preregisterSummaryApi';
import { putPreregisterWaitingCapacity } from '../api/scheduleApi';
import { LEDGER_REFRESH_MS } from './ledger';
import { scheduleQueryKeys } from './useSchedule';

export const preregisterSummaryQueryKey = (expoId: string) =>
  ['adminPreregisterSummary', expoId] as const;

/** 행사 사전등록 고유 인원. 프로그램 신청 현황과 같은 주기로 다시 조회한다 */
export const usePreregisterSummary = (expoId: string) =>
  useQuery({
    queryKey: preregisterSummaryQueryKey(expoId),
    queryFn: () => getAdminPreregisterSummary(expoId),
    refetchInterval: LEDGER_REFRESH_MS,
    // 실패는 섹션의 상태별 문구로 알리므로 서버 원문 전역 토스트는 끈다
    meta: { silent: true },
  });

/** 대기 승급이 멈춘 사유. 모르는 값은 그대로 보여 준다 */
export const formatPromotionBlockedReason = ({
  promotionBlockedReason,
  waitingHeadApplicants,
  freeConfirmedSeats,
}: AdminPreregisterSessionSummary) => {
  switch (promotionBlockedReason) {
    case null:
      return null;
    case 'CLOSED':
      return '모집 마감';
    case 'SESSION_STARTED':
      return '회차 시작됨';
    case 'HEAD_TOO_LARGE':
      return `선두 일행(${waitingHeadApplicants ?? '-'}명)이 빈 자리(${freeConfirmedSeats ?? '-'}석)보다 많아 대기 승급이 멈춤`;
    default:
      return promotionBlockedReason;
  }
};

interface AdoptWaitingCapacityVariables {
  sessionId: number;
  /** 관리자가 확인한 Expo 회차의 현재 대기 정원 */
  expected: number;
}

/**
 * Application 에서 대기 정원이 미적용인 회차에 Expo 현재 대기 정원을 적용한다.
 * 409 면 Expo 값이 바뀌었거나 회차 변경 확인 중이므로, 성공·실패와 상관없이 집계와 회차를 다시 읽는다
 */
export const useAdoptWaitingCapacity = (expoId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, AdoptWaitingCapacityVariables>({
    mutationFn: ({ sessionId, expected }) =>
      putPreregisterWaitingCapacity(expoId, sessionId, expected),
    onSuccess: () => {
      toast.success('대기 정원을 적용했습니다.');
    },
    onError: (error) => {
      toast.error(
        getErrorStatus(error) === 409
          ? '대기 정원이 바뀌었거나 회차 변경을 확인하는 중이라 적용하지 못했습니다. 최신 값을 다시 불러왔으니 확인 후 다시 적용해 주세요.'
          : error.message,
      );
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: preregisterSummaryQueryKey(expoId),
        }),
        queryClient.invalidateQueries({
          queryKey: scheduleQueryKeys.sessions(expoId),
        }),
      ]),
  });
};
