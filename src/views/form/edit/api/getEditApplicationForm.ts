import axios from 'axios';
import clientInstance from '@/shared/libs/http/clientInstance';

export const getEditApplicationForm = async (id: string, type: string) => {
  try {
    const response = await clientInstance.get(`/form/${id}?type=${type}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '신청 폼 불러오기 실패');
    }
    throw error;
  }
};
