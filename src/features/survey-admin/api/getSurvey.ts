import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { ApplicationForm } from '@/shared/types/application/type';

export type SurveyDetail = ApplicationForm & {
  id: string;
  /** 지금까지 쌓인 답변 수. 0보다 크면 수정 시 답변 연결이 끊긴다. */
  totalAnswers: number;
};

/** 설문이 아직 없으면(404) null을 돌려준다. */
export const getSurvey = async (
  expoId: string,
  type: 'STANDARD' | 'TRAINEE',
): Promise<SurveyDetail | null> => {
  try {
    const response = await clientTokenInstance.get<SurveyDetail>(
      `/surveys/${expoId}?type=${type}`,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 404) return null;
      throw new Error(
        error.response.data?.error || '만족도 조사를 불러오지 못했습니다.',
      );
    }
    throw error;
  }
};
