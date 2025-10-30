import axios from 'axios';
import clientInstance from '../libs/http/clientInstance';
import { ApplicationType } from '../types/exhibition/type';

export const getSurveyForm = async (
  expoId: string,
  userType: string,
  ApplicationType: ApplicationType,
) => {
  try {
    const response = await clientInstance.get(
      `/survey/${expoId}?type=${userType}&applicationType=${ApplicationType}`,
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
