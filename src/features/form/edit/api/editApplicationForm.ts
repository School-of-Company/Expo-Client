import { toFormError } from '@/entities/form/lib/errors';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { CreateFormRequest } from '@/shared/types/form/create/type';

export const editApplicationForm = async ({
  data,
  id,
}: {
  data: CreateFormRequest;
  id: string;
}) => {
  try {
    const response = await clientTokenInstance.patch(`/forms/${id}`, data);
    return response;
  } catch (error) {
    throw toFormError(error, '박람회 등록 폼 수정 실패');
  }
};
