import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface SignUpData {
  name: string;
  nickname: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export const signUp = async (
  data: SignUpData,
  router: ReturnType<typeof useRouter>,
) => {
  try {
    const response = await axios.post('/api/auth/signup', {
      name: data.name,
      nickname: data.nickname,
      email: data.email,
      password: data.password,
      phoneNumber: data.phoneNumber,
    });
    if (response.status === 200) {
      toast.success('회원가입이 완료되었습니다.');
      router.push('/signin');
    }
  } catch (error) {
    console.error('Signup failed', error);
    toast.error('회원가입에 실패했습니다.');
  }
};
