import clientInstance from '@/shared/libs/http/clientInstance';
import { FormattedSurveyData } from '@/shared/types/application/type';
import { toSurveyAnswerError } from '../lib/surveyAnswerErrors';

/** 저장은 비동기라 서버는 본문 없이 202(접수 완료)로 응답한다. */
export const postSurveyAnswer = async (
  expoId: string,
  userType: 'STANDARD' | 'TRAINEE',
  data: FormattedSurveyData,
) => {
  try {
    await clientInstance.post(
      `/surveys/answer/${userType === 'STANDARD' ? 'standard' : 'trainee'}/${expoId}`,
      data,
    );
  } catch (error) {
    throw toSurveyAnswerError(error, '만족도 조사 제출에 실패했습니다.');
  }
};
