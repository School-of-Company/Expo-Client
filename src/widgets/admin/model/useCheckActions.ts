import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { approveSignupApi, rejectSignupApi } from '../api/postAdminApi';

export const useCheckActions = () => {
  const queryClient = useQueryClient();

  const approveSignup = useMutation({
    mutationFn: approveSignupApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requestSignUp'] });
      toast.success('회원가입 승인 성공');
    },
    onError: () => {
      toast.error('회원가입 승인 실패');
    },
  });

  const rejectSignup = useMutation({
    mutationFn: rejectSignupApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requestSignUp'] });
      toast.success('회원가입 거절 성공');
    },
    onError: () => {
      toast.error('회원가입 거절 실패');
    },
  });

  return {
    approveSignup: approveSignup.mutateAsync,
    rejectSignup: rejectSignup.mutateAsync,
    isApproving: approveSignup.isPending,
    isApproved: approveSignup.isSuccess,
    isRejecting: rejectSignup.isPending,
    isRejected: rejectSignup.isSuccess,
  };
};
