import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  RegistrationApplyPeriodRequest,
  RegistrationProgramCreateRequest,
  RegistrationPromotionPolicyRequest,
  RegistrationScheduleSaveRequest,
  RegistrationSessionCreateRequest,
  RegistrationStatusChangeRequest,
  RegistrationStatusChangeResult,
} from '@/shared/types/registration/type';
import {
  mockDeleteRegistrationSession as deleteRegistrationSession,
  mockPatchRegistrationStatus as patchRegistrationStatus,
  mockPostRegistrationProgram as postRegistrationProgram,
  mockPostRegistrationSession as postRegistrationSession,
  mockPutRegistrationApplyPeriod as putRegistrationApplyPeriod,
  mockPutRegistrationPromotionPolicy as putRegistrationPromotionPolicy,
  mockPutRegistrationSchedule as putRegistrationSchedule,
} from '../api/mockRegistration';

const useRegistrationMutation = <TVariables, TResult = void>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
  getSuccessMessage: (result: TResult) => string,
  onSuccess?: () => void,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    // 갱신된 서버 값을 받은 뒤 화면 쪽 onSuccess 가 실행되도록 invalidate 를 기다린다
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['registrationOverview'] }),
        queryClient.invalidateQueries({ queryKey: ['registrationHistories'] }),
      ]);
      toast.success(getSuccessMessage(result));
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

const getStatusChangeMessage = ({
  changedCount,
  skippedCount,
  autoPromotedCount,
}: RegistrationStatusChangeResult) =>
  [
    `${changedCount}건 처리했습니다.`,
    skippedCount > 0 &&
      `${skippedCount}건은 대상이 아니거나 정원이 없어 제외했습니다.`,
    autoPromotedCount > 0 &&
      `대기자 ${autoPromotedCount}명이 자동 승급되었습니다.`,
  ]
    .filter(Boolean)
    .join(' ');

export const useChangeApplicationStatus = (onSuccess?: () => void) =>
  useRegistrationMutation(
    (data: RegistrationStatusChangeRequest) => patchRegistrationStatus(data),
    getStatusChangeMessage,
    onSuccess,
  );

export const useSaveSchedule = () =>
  useRegistrationMutation(
    (data: RegistrationScheduleSaveRequest) => putRegistrationSchedule(data),
    () => '프로그램·회차 변경 내용을 저장했습니다.',
  );

export const useApplyPeriod = () =>
  useRegistrationMutation(
    (data: RegistrationApplyPeriodRequest) => putRegistrationApplyPeriod(data),
    () => '전체 신청기간을 적용했습니다.',
  );

export const usePromotionPolicy = () =>
  useRegistrationMutation(
    (data: RegistrationPromotionPolicyRequest) =>
      putRegistrationPromotionPolicy(data),
    () => '승급 정책을 전체 회차에 적용했습니다.',
  );

export const useCreateProgram = (onSuccess?: () => void) =>
  useRegistrationMutation(
    (data: RegistrationProgramCreateRequest) => postRegistrationProgram(data),
    () => '신규 프로그램을 등록했습니다. 상태는 CLOSED 로 시작합니다.',
    onSuccess,
  );

export const useCreateSession = (onSuccess?: () => void) =>
  useRegistrationMutation(
    (data: RegistrationSessionCreateRequest) => postRegistrationSession(data),
    () => '신규 회차를 개설했습니다.',
    onSuccess,
  );

export const useDeleteSession = () =>
  useRegistrationMutation(
    (sessionId: number) => deleteRegistrationSession(sessionId),
    () => '회차를 삭제했습니다.',
  );
