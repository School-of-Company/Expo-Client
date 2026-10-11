import axios from 'axios';
import clientInstance from '../libs/http/clientInstance';
import { ApplicationForm } from '../types/application/type';

export type PublicSurvey = ApplicationForm & {
  expoId: string;
  lotteryEnabled: boolean;
};

export const getPublicSurvey = async (
  expoId: string,
): Promise<PublicSurvey> => {
  try {
    const response = await clientInstance.get(`/surveys/public/${expoId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 404) {
        throw new Error('진행 중인 만족도 조사가 없습니다.');
      }
      throw new Error(error.response.data.error || '설문 불러오기 실패');
    }
    throw error;
  }
};
