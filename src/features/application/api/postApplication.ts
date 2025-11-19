import axios from 'axios';
import clientInstance from '@/shared/libs/http/clientInstance';
import {
  FormattedApplicationData,
  FormattedSurveyData,
} from '@/shared/types/application/type';
import { ApplicationType } from '@/shared/types/exhibition/type';

const URL_MAP: Record<'application' | 'survey', Record<string, string>> = {
  application: {
    STANDARD_PRE: '/application/pre-standard/',
    TRAINEE_PRE: '/application/',
    STANDARD_FIELD: '/application/field/standard/',
    TRAINEE_FIELD: '/application/field/',
    STANDARD_FIELD_TEMPORARY: '/application/field/temporary/',
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
  applicationType: ApplicationType,
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
    applicationType === 'FIELD' &&
    (!('phoneNumber' in data) || !data.phoneNumber);

  if (isStandardOnsiteTemporary) {
    key = 'STANDARD_FIELD_TEMPORARY';
  }

  const url = `${baseUrl[key] || '/api/application/'}${params}`;
  const instance = clientInstance;

  try {
    const response = await instance.post(url, data);
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
      throw new Error(error.response.data.error || '폼 등록 실패');
    }

    throw error;
  }
};
