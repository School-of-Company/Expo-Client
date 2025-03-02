import axios from 'axios';
import { FormattedApplicationData } from '@/shared/types/application/type';

export type SurveyData = {
  phoneNumber: string;
  answerJson: string;
};

const URL_MAP: Record<'application' | 'survey', Record<string, string>> = {
  application: {
    STANDARD_register: '/api/application/pre-standard/',
    TRAINEE_register: '/api/application/',
    STANDARD_onsite: '/api/application/field/standard/',
    TRAINEE_onsite: '/api/application/field/',
  },
  survey: {
    STANDARD: '/api/survey/answer/standard/',
    TRAINEE: '/api/survey/answer/trainee/',
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

  const response = await axios.post(url, data);
  return response.data;
};
