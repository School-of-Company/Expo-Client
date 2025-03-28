import axios from 'axios';
import { ExpoItem } from '@/shared/types/admin/type';

export const getExpoList = async (): Promise<ExpoItem[]> => {
  try {
    const response = await axios.get('/api/server/token/expo');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '박람회 불러오기 실패');
    }
    throw error;
  }
};
