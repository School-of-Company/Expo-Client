'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getSessionIssue } from '@/features/phone-verification';
import {
  OwnerApplicationType,
  addMyPreRegisterCompanions,
  cancelMyApplication,
  cancelMyPreRegisterWaitlist,
  getMyApplications,
  getMyPreRegisterWaitlist,
  getMyPromotionOffers,
  respondPromotionOffer,
} from '../api/myApplications';
import { getOfferErrorMessage } from './promotionOffer';
import type { Companion } from '@/shared/types/application/type';

// 401 은 세션 문제(sessionIssue)로 따로 안내하므로 오류 문구에서 뺀다. 5xx·네트워크 오류는 오류로 보여 준다
const visibleError = (error: Error | null) =>
  error && !getSessionIssue(error) ? error.message : undefined;

export const useMyApplications = (expoId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['myApplications', expoId];
  const waitlistKey = ['myPreRegisterWaitlist', expoId];
  const offersKey = ['myPromotionOffers', expoId];

  const { data, error, refetch } = useQuery({
    queryKey,
    queryFn: () => getMyApplications(expoId),
    retry: false,
    // 인증 전(401)에는 실패가 정상이라 토스트를 띄우지 않는다. 그 밖의 오류는 목록에서 안내한다
    meta: { silent: true },
  });

  // 대기 일행은 User 에 없어 위 목록에 나오지 않으므로 따로 조회한다
  const {
    data: waitlist,
    error: waitlistError,
    refetch: refetchWaitlist,
  } = useQuery({
    queryKey: waitlistKey,
    queryFn: () => getMyPreRegisterWaitlist(expoId),
    retry: false,
    meta: { silent: true },
  });

  // 서버 기능 스위치가 꺼져 있으면 실패할 수 있으므로 오류는 숨기고 제안 없음으로 둔다
  const { data: offerData } = useQuery({
    queryKey: offersKey,
    queryFn: () => getMyPromotionOffers(expoId),
    retry: false,
    meta: { silent: true },
  });

  // 취소·승급으로 신청·대기·잔여석·QR 이 함께 바뀌므로 성공·실패 모두 다시 받는다(새 CSRF 토큰 포함)
  const refresh = () =>
    Promise.all(
      [
        queryKey,
        waitlistKey,
        offersKey,
        ['preRegisterCapacity', expoId],
        ['participantQr', expoId],
      ].map((key) => queryClient.invalidateQueries({ queryKey: key })),
    );

  const { mutate: cancel } = useMutation({
    mutationFn: (target: {
      type: OwnerApplicationType;
      applicationId: string;
    }) =>
      cancelMyApplication(
        expoId,
        target.type,
        target.applicationId,
        data?.csrfToken,
      ),
    onSuccess: () => toast.success('신청이 취소되었습니다.'),
    onError: (error: Error) => toast.error(error.message),
    onSettled: refresh,
  });

  const { mutate: cancelWaitlist, isPending: isCancellingWaitlist } =
    useMutation({
      mutationFn: () =>
        cancelMyPreRegisterWaitlist(expoId, waitlist?.csrfToken),
      onSuccess: () => toast.success('대기 신청이 취소되었습니다.'),
      onError: (error: Error) => toast.error(error.message),
      onSettled: refresh,
    });

  // 결과 안내는 화면이 한다. 실패해도 추가 가능 인원이 바뀌었을 수 있어 다시 받는다
  const { mutateAsync: addCompanions, isPending: isAddingCompanions } =
    useMutation({
      mutationFn: (target: {
        applicationId: string;
        companions: Companion[];
        idempotencyKey: string;
      }) =>
        addMyPreRegisterCompanions(
          expoId,
          target.applicationId,
          target.companions,
          target.idempotencyKey,
          data?.csrfToken,
        ),
      onSettled: refresh,
    });

  // 수락·거절 모두 성공·실패 뒤 다시 받는다. 실패(409)해도 서버 상태를 따른다
  const { mutate: respondOffer, isPending: isRespondingOffer } = useMutation({
    mutationFn: (target: {
      offerId: string;
      action: 'acceptance' | 'decline';
    }) =>
      respondPromotionOffer(
        expoId,
        target.offerId,
        target.action,
        offerData?.csrfToken,
      ),
    onSuccess: (_, { action }) =>
      toast.success(
        action === 'acceptance'
          ? '참여가 수락되었습니다. 신청 현황에서 확정 내역과 QR 을 확인해주세요.'
          : '참여 제안을 거절했습니다.',
      ),
    onError: (error: Error) => toast.error(getOfferErrorMessage(error)),
    onSettled: refresh,
  });

  return {
    participants: data?.participants ?? [],
    applications: data?.applications ?? [],
    // required: 인증한 적 없음, expired: 만료. 취소 뒤 재조회가 401 이면 이쪽으로 드러난다
    sessionIssue: getSessionIssue(error) ?? getSessionIssue(waitlistError),
    errorMessage: visibleError(error),
    retry: () => Promise.all([refetch(), refetchWaitlist()]),
    waitlist: waitlist ?? null,
    waitlistErrorMessage: visibleError(waitlistError),
    // 응답 대기 중(PENDING)·응답 가능(OPEN) 제안만 카드로 보인다
    offers: (offerData?.offers ?? []).filter(
      ({ status }) => status === 'PENDING' || status === 'OPEN',
    ),
    respondOffer,
    isRespondingOffer,
    cancel,
    cancelWaitlist,
    isCancellingWaitlist,
    addCompanions,
    isAddingCompanions,
  };
};
