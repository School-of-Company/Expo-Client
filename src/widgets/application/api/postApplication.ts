import axios from 'axios';
import clientInstance from '@/shared/libs/http/clientInstance';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import {
  FormattedApplicationData,
  FormattedSurveyData,
} from '@/shared/types/application/type';

const URL_MAP: Record<'application' | 'survey', Record<string, string>> = {
  application: {
    STANDARD_register: '/application/pre-standard/',
    TRAINEE_register: '/application/',
    STANDARD_onsite: '/application/field/standard/',
    TRAINEE_onsite: '/application/field/',
    STANDARD_onsite_temporary: '/application/field/temporary/',
  },
  survey: {
    STANDARD: '/survey/answer/standard/',
    TRAINEE: '/survey/answer/trainee/',
  },
};

export const postApplication = async (
  params: string,
  formType: 'application' | 'survey',
  userType: 'STANDARD' | 'TRAINEE',
  applicationType: 'register' | 'onsite',
  data: FormattedApplicationData | FormattedSurveyData,
) => {
  const baseUrl = URL_MAP[formType] || {};
  let key =
    formType === 'application'
      ? (`${userType}_${applicationType}` as keyof typeof URL_MAP.application)
      : userType;

  const isStandardOnsiteTemporary =
    formType === 'application' &&
    userType === 'STANDARD' &&
    applicationType === 'onsite' &&
    (!('phoneNumber' in data) || !data.phoneNumber);

  if (isStandardOnsiteTemporary) {
    key = 'STANDARD_onsite_temporary';
  }

  const url = `${baseUrl[key] || '/api/application/'}${params}`;
  const instance = isStandardOnsiteTemporary
    ? clientTokenInstance
    : clientInstance;

  try {
    const response = await instance.post(url, data, {
      ...(isStandardOnsiteTemporary && { skipAuthRedirect: true }),
      headers: {
        ...(isStandardOnsiteTemporary && { 'x-skip-auth-redirect': 'true' }),
      },
    });
    return response.data;
  } catch (error) {
    if (
      isStandardOnsiteTemporary &&
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      error.response.data?.isRefreshError
    ) {
      throw new Error('전화번호가 없다면 관리자에게 문의해주세요.');
    }

    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '폼 신청 실패');
    }

    throw error;
  }
};
