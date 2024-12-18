import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { postSignin } from '../api/postSignin';

interface SignInData {
  nickname: string;
  password: string;
}

export const useSignin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: SignInData) => postSignin(data),
    onSuccess: () => {
      toast.success('로그인이 완료되었습니다.');
      router.push('/');
    },
    onError: () => {
      toast.error('로그인에 실패했습니다.');
    },
  });
};
