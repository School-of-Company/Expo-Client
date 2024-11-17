import axios from 'axios';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { toast } from 'react-toastify';

interface SignUpData {
  nickname: string;
  password: string;
}

export const signIn = async (data: SignUpData, router: AppRouterInstance) => {
  try {
    const response = await axios.post('/api/auth/signin', {
      nickname: data.nickname,
      password: data.password,
    });
    if (response.status === 200) {
      toast.success('로그인이 완료되었습니다.');
      router.push('/');
    }
  } catch (error) {
    console.error('Signup failed', error);
    toast.error('로그인에 실패했습니다.');
  }
};
