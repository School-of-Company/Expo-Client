import axios from 'axios';
import clientInstance from '@/shared/libs/http/clientInstance';

export const getApplicationForm = async (id: string, userType: string) => {
  try {
    const response = await clientInstance.get(`/form/${id}?type=${userType}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || '박람회 등록 폼 불러오기 실패',
      );
    }
    throw error;
  }
};
