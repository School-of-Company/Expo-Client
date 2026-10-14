import { toApiError } from '@/shared/libs/http/apiError';
import clientInstance from '@/shared/libs/http/clientInstance';
import { ApplicationType } from '../types/exhibition/type';
import { getMockForm } from './mockForm';

export const getApplicationForm = async (
  id: string,
  userType: string,
  application: ApplicationType,
) => {
  if (id === 'mock') return getMockForm('application', userType, application);

  try {
    const response = await clientInstance.get(
      `/forms/${id}?type=${userType}&applicationType=${application}`,
    );
    return response.data;
  } catch (error) {
    // 폼이 없으면 404(FORM_NOT_FOUND). 화면이 상태로 "폼 없음"을 가를 수 있게 남긴다
    throw toApiError(error, '박람회 등록 폼 불러오기 실패');
  }
};
