import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  getPreregisterSessions,
  getSchedulePrograms,
  PreregisterSession,
  ScheduleProgram,
} from '../api/scheduleApi';

export const scheduleQueryKeys = {
  sessions: (expoId: string) => ['preregisterSessions', expoId] as const,
  programs: (expoId: string) => ['schedulePrograms', expoId] as const,
};

export const usePreregisterSessions = (expoId: string) =>
  useQuery<PreregisterSession[], Error>({
    queryKey: scheduleQueryKeys.sessions(expoId),
    queryFn: () => getPreregisterSessions(expoId),
    enabled: Boolean(expoId),
  });

export const useSchedulePrograms = (expoId: string) =>
  useQuery<ScheduleProgram[], Error>({
    queryKey: scheduleQueryKeys.programs(expoId),
    queryFn: () => getSchedulePrograms(expoId),
    enabled: Boolean(expoId),
  });

/** 여러 건을 차례로 저장한 뒤처럼 직접 서버 값을 다시 읽어야 할 때 쓴다 */
export const useInvalidateSchedule = (expoId: string) => {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: scheduleQueryKeys.sessions(expoId),
      }),
      queryClient.invalidateQueries({
        queryKey: scheduleQueryKeys.programs(expoId),
      }),
    ]);
};

/**
 * 일정 화면 변경 요청. 성공·실패와 상관없이 서버 값을 다시 읽는다.
 * revision 충돌(409)이면 화면이 최신 revision 을 받아야 다시 저장할 수 있기 때문이다.
 */
export const useScheduleMutation = <TVariables, TResult = void>(
  expoId: string,
  mutationFn: (variables: TVariables) => Promise<TResult>,
  successMessage: string,
  onSuccess?: () => void,
) => {
  const invalidate = useInvalidateSchedule(expoId);
  return useMutation<TResult, Error, TVariables>({
    mutationFn,
    onSuccess: () => {
      toast.success(successMessage);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: invalidate,
  });
};
