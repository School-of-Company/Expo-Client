import axios from 'axios';
import { Occupation } from '@/entities/form';
import clientInstance from '@/shared/libs/http/clientInstance';
import { SurveyAnswers } from '@/shared/types/application/type';

export const postQrSurveyAnswer = async (
  token: string,
  data: { answers: SurveyAnswers; occupation: Occupation },
) => {
  try {
    await clientInstance.post(`/surveys/answer/qr/${token}`, data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 409) {
        throw new Error('이미 응답한 QR입니다.');
      }
      throw new Error(error.response.data.error || '설문 제출 실패');
    }
    throw error;
  }
};
