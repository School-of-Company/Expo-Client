import axios from 'axios';
import clientTokenInstance from '../libs/http/clientTokenInstance';
import { ExpoStandard } from '../types/expo-detail/type';

export const getExpoStandard = async (id: string): Promise<ExpoStandard[]> => {
  try {
    const response = await clientTokenInstance.get(`/standard/program/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || '참가자 프로그램 불러오기 실패',
      );
    }
    throw error;
  }
};
