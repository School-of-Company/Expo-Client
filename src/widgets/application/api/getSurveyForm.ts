import axios from 'axios';
import clientInstance from '@/shared/libs/clientInstance';

export const getSurveyForm = async (expoId: string, userType: string) => {
  try {
    const response = await clientInstance.get(
      `/survey/${expoId}?type=${userType}`,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || '만족도 조사 폼 불러오기 실패',
      );
    }
    throw error;
  }
};
