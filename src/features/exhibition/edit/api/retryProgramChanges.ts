import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';

// 중단된 프로그램 변경을 서버에 저장된 내용으로 이어서 처리한다(204)
export const retryProgramChanges = async (id: string) => {
  try {
    await clientTokenInstance.post(
      `/expo/${encodeURIComponent(id)}/program-changes/retry`,
    );
  } catch (error) {
    throw toApiError(error, '프로그램 변경 재시도 실패');
  }
};
