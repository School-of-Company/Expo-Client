import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { EditExhibitionData } from '@/shared/types/exhibition/edit/type';

export const editExhibition = async (data: EditExhibitionData, id: string) => {
  try {
    await clientTokenInstance.patch(`/expo/${encodeURIComponent(id)}`, data);
  } catch (error) {
    // 409 원인을 화면에서 구분할 수 있도록 상태를 보존한다
    throw toApiError(error, '박람회 수정 실패');
  }
};
