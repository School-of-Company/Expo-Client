'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import {
  OwnerApplicationType,
  cancelMyApplication,
  cancelPreRegisterWaitlist,
  getPreRegisterWaitlist,
  getMyApplications,
} from '../api/myApplications';

export const useMyApplications = (expoId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['myApplications', expoId];

  const { data, error } = useQuery({
    queryKey,
    queryFn: () => getMyApplications(expoId),
    retry: false,
    // 인증 전(401)에는 실패가 정상이라 토스트를 띄우지 않는다. 그 밖의 오류는 목록에서 안내한다
    meta: { silent: true },
  });

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
    // 성공·실패 모두 최신 상태와 새 CSRF 토큰을 다시 받는다
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const waitlistKey = ['preRegisterWaitlist', expoId];
  const { data: waitlist, error: waitlistError } = useQuery({
    queryKey: waitlistKey,
    queryFn: () => getPreRegisterWaitlist(expoId),
    retry: false,
    meta: { silent: true },
  });

  const { mutate: cancelWaitlist, isPending: isCancellingWaitlist } =
    useMutation({
      mutationFn: () => cancelPreRegisterWaitlist(expoId, waitlist?.csrfToken),
      onSuccess: () => toast.success('대기 신청이 취소되었습니다.'),
      onError: (error: Error) => toast.error(error.message),
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: waitlistKey });
        queryClient.invalidateQueries({ queryKey });
      },
    });

  return {
    waitlist,
    waitlistErrorMessage: waitlistError?.message,
    cancelWaitlist,
    isCancellingWaitlist,
    participants: data?.participants ?? [],
    applications: data?.applications ?? [],
    // 401(인증 전)은 정상 흐름이라 오류로 보지 않는다
    errorMessage:
      error && getErrorStatus(error) !== 401 ? error.message : undefined,
    cancel,
  };
};
