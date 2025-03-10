import axios from 'axios';
import { SignUpData } from '@/shared/types/signup/type';

export const postSignup = async (data: SignUpData) => {
  try {
    const response = await axios.post('/api/auth/signup', data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '회원가입에 실패했습니다.');
    }
    throw error;
  }
};
