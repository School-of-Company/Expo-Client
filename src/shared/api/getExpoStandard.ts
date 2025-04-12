import axios from 'axios';
import { ExpoStandard } from '../types/expo-detail/type';

export const getExpoStandard = async (id: string): Promise<ExpoStandard[]> => {
  try {
    const response = await axios.get(
      `/api/server/token/standard/program/${id}`,
    );
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
