'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  getPreRegister,
  postPreRegister,
  PreRegisterBody,
} from '../api/preRegister';

export const usePreRegister = (expoId: string, sessionId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['preRegister', expoId, sessionId];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => getPreRegister(expoId, sessionId),
  });

  const mutation = useMutation({
    mutationFn: (body: PreRegisterBody) =>
      postPreRegister(expoId, sessionId, body),
    onSuccess: () => {
      toast.success('신청이 완료되었습니다.');
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['myApplications', expoId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    data,
    isLoading,
    apply: mutation.mutate,
    isApplying: mutation.isPending,
  };
};
