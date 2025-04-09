import axios from 'axios';
import { CreateFormRequest } from '@/shared/types/form/create/type';

export const editSurveyForm = async ({
  data,
  id,
}: {
  data: CreateFormRequest;
  id: string;
}) => {
  try {
    const response = await axios.patch(`/api/server/token/survey/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '만족도 조사폼 수정 실패');
    }
    throw error;
  }
};
