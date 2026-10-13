import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';

// 박람회 수정·일정 관리 화면이 함께 쓰는 재시도 요청이다.
// 중단된 프로그램 변경을 서버에 저장된 내용으로 이어서 처리한다(204)
export const retryProgramChanges = async (expoId: string): Promise<void> => {
  try {
    await clientTokenInstance.post(
      `/expo/${encodeURIComponent(expoId)}/program-changes/retry`,
    );
  } catch (error) {
    throw toApiError(error, '프로그램 변경을 다시 처리하지 못했습니다.');
  }
};
