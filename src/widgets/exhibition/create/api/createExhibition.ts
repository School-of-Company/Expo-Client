import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { CreateExhibitionData } from '@/shared/types/exhibition/create/type';

export const createExhibition = async (data: CreateExhibitionData) => {
  try {
    const response = await clientTokenInstance.post('/expo', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '박람회 생성 실패');
    }
    throw error;
  }
};
