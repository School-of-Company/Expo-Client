import axios from 'axios';
import clientTokenInstance from '../libs/clientTokenInstance';
import { ExpoDetail } from '../types/expo-detail/type';

export const getExpoDetail = async (id: number): Promise<ExpoDetail> => {
  try {
    const response = await clientTokenInstance.get(`/expo/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '박람회 상세 불러오기 실패');
    }
    throw error;
  }
};
