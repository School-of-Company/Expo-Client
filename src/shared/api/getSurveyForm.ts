import { toApiError } from '../libs/http/apiError';
import clientInstance from '../libs/http/clientInstance';
import { ApplicationType } from '../types/exhibition/type';
import { getMockForm } from './mockForm';

export const getSurveyForm = async (
  expoId: string,
  userType: string,
  ApplicationType: ApplicationType,
) => {
  if (expoId === 'mock')
    return getMockForm('survey', userType, ApplicationType);

  try {
    const response = await clientInstance.get(
      `/surveys/${expoId}?type=${userType}`,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '만족도 조사 폼 불러오기 실패');
  }
};
