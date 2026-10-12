import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { SignUpData } from '@/shared/types/signup/type';
import { postSignup } from '../api/postSignup';

export const useSignup = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: SignUpData) => postSignup(data),
    onSuccess: () => {
      // 가입 직후에는 대기 상태라 관리자가 승인해야 로그인할 수 있다
      toast.success(
        '회원가입 신청이 완료되었습니다. 관리자 승인 후 로그인할 수 있습니다.',
      );
      router.push('/signin');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
