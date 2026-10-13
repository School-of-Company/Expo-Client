import { toFormError } from '@/features/form/common/api/formErrors';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { CreateFormRequest } from '@/shared/types/form/create/type';

export const createSurveyForm = async ({
  data,
  id,
}: {
  data: CreateFormRequest;
  id: string;
}) => {
  try {
    const response = await clientTokenInstance.post(`/surveys/${id}`, data);
    return response;
  } catch (error) {
    throw toFormError(error, '만족도 조사 폼 생성 실패');
  }
};
