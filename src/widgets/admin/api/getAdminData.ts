import axios from 'axios';
import { AdminData } from '@/shared/types/admin/type';

export const getAdminData = async (): Promise<AdminData> => {
  try {
    const response = await axios.get('/api/server/token/admin/my');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || '관리자 프로필 불러오기 실패',
      );
    }
    throw error;
  }
};
