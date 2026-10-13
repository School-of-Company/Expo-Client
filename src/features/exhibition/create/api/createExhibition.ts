import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { CreateExhibitionData } from '@/shared/types/exhibition/create/type';

export const createExhibition = async (data: CreateExhibitionData) => {
  try {
    const response = await clientTokenInstance.post('/expo', data);
    return response.data;
  } catch (error) {
    throw toApiError(error, '박람회 생성 실패');
  }
};
