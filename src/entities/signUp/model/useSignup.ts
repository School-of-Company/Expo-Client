import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { postSignup } from '../api/postSignup';

interface SignUpData {
  name: string;
  nickname: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export const useSignup = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: SignUpData) => postSignup(data),
    onSuccess: () => {
      toast.success('회원가입이 완료되었습니다.');
      router.push('/signIn');
    },
    onError: () => {
      toast.error('회원가입에 실패했습니다.');
    },
  });
};
