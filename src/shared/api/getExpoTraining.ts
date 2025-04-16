import axios from 'axios';
import clientTokenInstance from '../libs/clientTokenInstance';
import { ExpoTrainingDetail } from '../types/expo-detail/type';

export const getExpoTraining = async (
  id: number,
): Promise<ExpoTrainingDetail[]> => {
  try {
    const response = await clientTokenInstance.get(`/training/program/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || '연수자 프로그램 불러오기 실패',
      );
    }
    throw error;
  }
};
