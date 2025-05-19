import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { CreateFormRequest } from '@/shared/types/form/create/type';

export const editApplicationForm = async ({
  data,
  id,
}: {
  data: CreateFormRequest;
  id: string;
}) => {
  try {
    const response = await clientTokenInstance.patch(`/form/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '박람회 등록 폼 수정 실패');
    }
    throw error;
  }
};
