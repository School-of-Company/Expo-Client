import axios from 'axios';
import { CreateFormRequest } from '@/shared/types/form/create/type';

export const createApplicationForm = async ({
  data,
  id,
}: {
  data: CreateFormRequest;
  id: string;
}) => {
  try {
    const response = await axios.post(`/api/server/token/form/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '박람회 신청 폼 생성 실패');
    }
    throw error;
  }
};
