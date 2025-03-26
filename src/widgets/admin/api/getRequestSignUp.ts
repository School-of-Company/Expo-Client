import axios from 'axios';
import { SignUpItem } from '@/shared/types/admin/type';

export const getRequestSignUp = async (): Promise<SignUpItem[]> => {
  try {
    const response = await axios.get('/api/server/token/admin');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || '회원가입 리스트 불러오기 실패',
      );
    }
    throw error;
  }
};
