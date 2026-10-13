import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { ExpoValid } from '@/shared/types/admin/type';

interface ExpoValidationResponse {
  expoValid: ExpoValid[];
}

/** 관리자가 가진 박람회 전체의 폼·설문 생성 여부. 쿼리 파라미터 없이 한 번에 받는다 */
export const getExpoValid = async (): Promise<ExpoValid[]> => {
  try {
    const response =
      await clientTokenInstance.get<ExpoValidationResponse>('/expo/valid');
    return response.data.expoValid ?? [];
  } catch (error) {
    throw toApiError(error, '폼·설문 생성 여부 불러오기 실패');
  }
};
