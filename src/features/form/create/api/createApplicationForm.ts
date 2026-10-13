import { toFormError } from '@/features/form/common/api/formErrors';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { CreateFormRequest } from '@/shared/types/form/create/type';

export const createApplicationForm = async ({
  data,
  id,
}: {
  data: CreateFormRequest;
  id: string;
}) => {
  try {
    const response = await clientTokenInstance.post(`/forms/${id}`, data);
    return response;
  } catch (error) {
    throw toFormError(error, '박람회 등록 폼 생성 실패');
  }
};
