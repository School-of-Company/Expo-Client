'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import {
  OwnerApplicationType,
  cancelMyApplication,
  cancelMyPreRegisterWaitlist,
  getMyApplications,
  getMyPreRegisterWaitlist,
} from '../api/myApplications';

// 401(인증 전)은 정상 흐름이라 오류로 보지 않는다
const visibleError = (error: Error | null) =>
  error && getErrorStatus(error) !== 401 ? error.message : undefined;

export const useMyApplications = (expoId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['myApplications', expoId];
  const waitlistKey = ['myPreRegisterWaitlist', expoId];

  const { data, error } = useQuery({
    queryKey,
    queryFn: () => getMyApplications(expoId),
    retry: false,
    // 인증 전(401)에는 실패가 정상이라 토스트를 띄우지 않는다. 그 밖의 오류는 목록에서 안내한다
    meta: { silent: true },
  });

  // 대기 일행은 User 에 없어 위 목록에 나오지 않으므로 따로 조회한다
  const { data: waitlist, error: waitlistError } = useQuery({
    queryKey: waitlistKey,
    queryFn: () => getMyPreRegisterWaitlist(expoId),
    retry: false,
    meta: { silent: true },
  });

  // 취소·승급으로 신청·대기·잔여석·QR 이 함께 바뀌므로 성공·실패 모두 다시 받는다(새 CSRF 토큰 포함)
  const refresh = () =>
    Promise.all(
      [
        queryKey,
        waitlistKey,
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

  return {
    participants: data?.participants ?? [],
    applications: data?.applications ?? [],
    errorMessage: visibleError(error),
    waitlist: waitlist ?? null,
    waitlistErrorMessage: visibleError(waitlistError),
    cancel,
    cancelWaitlist,
    isCancellingWaitlist,
  };
};
