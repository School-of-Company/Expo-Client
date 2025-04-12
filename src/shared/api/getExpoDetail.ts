import axios from 'axios';
import { ExpoDetail } from '../types/expo-detail/type';

export const getExpoDetail = async (id: string): Promise<ExpoDetail> => {
  try {
    const response = await axios.get(`/api/server/token/expo/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '박람회 상세 불러오기 실패');
    }
    throw error;
  }
};
