import { Occupation } from '@/entities/form';
import clientInstance from '@/shared/libs/http/clientInstance';
import { SurveyAnswers } from '@/shared/types/application/type';
import { toSurveyAnswerError } from '../lib/surveyAnswerErrors';

export interface PublicSurveyAnswerResult {
  won: boolean;
  drawNumber: number | null;
}

export const postPublicSurveyAnswer = async (
  expoId: string,
  data: {
    answers: SurveyAnswers;
    occupation: Occupation;
    phoneNumber?: string;
    personalInformationStatus?: boolean;
  },
): Promise<PublicSurveyAnswerResult> => {
  try {
    const response = await clientInstance.post<PublicSurveyAnswerResult>(
      `/surveys/answer/public/${expoId}`,
      data,
    );
    return response.data;
  } catch (error) {
    throw toSurveyAnswerError(error, '설문 제출 실패');
  }
};
