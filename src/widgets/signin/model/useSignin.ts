import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { SignInData } from '@/shared/types/signin/type';
import { postSignin } from '../api/postSignin';

export const useSignin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: SignInData) => postSignin(data),
    onSuccess: () => {
      toast.success('로그인이 완료되었습니다.');
      router.push('/');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
