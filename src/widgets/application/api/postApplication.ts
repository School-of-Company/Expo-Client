import axios from 'axios';
import { FormattedApplicationData } from '@/shared/types/application/type';

export type SurveyData = {
  phoneNumber: string;
  answerJson: string;
};

const URL_MAP: Record<'application' | 'survey', Record<string, string>> = {
  application: {
    STANDARD_register: '/api/server/application/pre-standard/',
    TRAINEE_register: '/api/server/application/',
    STANDARD_onsite: '/api/server/application/field/standard/',
    TRAINEE_onsite: '/api/server/application/field/',
  },
  survey: {
    STANDARD: '/api/server/survey/answer/standard/',
    TRAINEE: '/api/server/survey/answer/trainee/',
  },
};

export const postApplication = async (
  params: string,
  formType: 'application' | 'survey',
  userType: 'STANDARD' | 'TRAINEE',
  applicationType: 'register' | 'onsite',
  data: FormattedApplicationData | SurveyData,
) => {
  const baseUrl = URL_MAP[formType] || {};
  const key =
    formType === 'application'
      ? (`${userType}_${applicationType}` as const)
      : userType;

  const url = `${baseUrl[key] || '/api/application/'}${params}`;
  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '폼 신청 실패');
    }
    throw error;
  }
};
