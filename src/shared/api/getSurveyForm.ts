import { toApiError } from '../libs/http/apiError';
import clientInstance from '../libs/http/clientInstance';
import { getMockForm } from './mockForm';

/** 설문은 (박람회, 참여자군) 조합당 하나라 신청방식을 받지 않는다. */
export const getSurveyForm = async (expoId: string, userType: string) => {
  if (expoId === 'mock') return getMockForm('survey', userType, 'PRE');

  try {
    const response = await clientInstance.get(
      `/surveys/${expoId}?type=${userType}`,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '만족도 조사 폼 불러오기 실패');
  }
};
