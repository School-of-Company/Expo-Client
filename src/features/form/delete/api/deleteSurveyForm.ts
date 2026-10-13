import { toFormError } from '@/features/form/common/api/formErrors';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';

/** 설문과 딸린 문항, 공개 링크 응답을 함께 삭제한다. */
export const deleteSurveyForm = async (
  expoId: string,
  participationType: 'STANDARD' | 'TRAINEE',
) => {
  try {
    await clientTokenInstance.delete(`/surveys/${expoId}/${participationType}`);
  } catch (error) {
    throw toFormError(error, '만족도 조사 폼 삭제 실패');
  }
};
