import axios from 'axios';
import { Occupation } from '@/entities/form';
import clientInstance from '@/shared/libs/http/clientInstance';
import { SurveyAnswers } from '@/shared/types/application/type';

/**
 * 공개 설문 익명 제출(Form PR #95). 응답자를 식별하지 않고 중복 응답도 막지 않아
 * 종이 QR 제출과 달리 409 처리가 없다.
 */
export const postPublicSurveyAnswer = async (
  expoId: string,
  data: { answers: SurveyAnswers; occupation: Occupation },
) => {
  try {
    await clientInstance.post(`/surveys/answer/public/${expoId}`, data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 404) {
        throw new Error('진행 중인 설문이 없습니다.');
      }
      throw new Error(error.response.data.error || '설문 제출 실패');
    }
    throw error;
  }
};
