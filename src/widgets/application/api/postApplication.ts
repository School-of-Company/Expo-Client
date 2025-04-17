import axios from 'axios';
import clientInstance from '@/shared/libs/http/clientInstance';
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

  if (
    formType === 'application' &&
    userType === 'STANDARD' &&
    applicationType === 'onsite' &&
    (!('phoneNumber' in data) || !data.phoneNumber)
  ) {
    key = 'STANDARD_onsite_temporary';
  }

  const url = `${baseUrl[key] || '/api/application/'}${params}`;
  try {
    const response = await clientInstance.post(url, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '폼 신청 실패');
    }
    throw error;
  }
};
