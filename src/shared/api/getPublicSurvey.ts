import axios from 'axios';
import clientInstance from '../libs/http/clientInstance';
import type { DynamicFormItem } from '../types/application/type';

/** 공개 설문 응답(`PublicSurveyResponseDto`). */
export interface PublicSurvey {
  id: string;
  expoId: string;
  title: string;
  informationText: string;
  participationType: 'STANDARD' | 'TRAINEE';
  totalAnswers: number;
  dynamicSurveyResponseDto: DynamicFormItem[];
  lotteryEnabled: boolean;
}

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
