import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';

export const deleteExpoApi = async (id: string): Promise<void> => {
  try {
    await clientTokenInstance.delete(`/expo/${encodeURIComponent(id)}`);
  } catch (error) {
    throw toApiError(error, '박람회 삭제 실패');
  }
};
