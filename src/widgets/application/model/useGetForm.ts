import { useQuery } from '@tanstack/react-query';
import { ApplicationForm } from '@/shared/types/application/type';
import { getApplicationForm } from '../api/getApplicationForm';
import { getSurveyForm } from '../api/getSurveyForm';

export const useGetApplicationForm = (
  id: string,
  userType: 'STANDARD' | 'TRAINEE',
) => {
  return useQuery<ApplicationForm, Error>({
    queryKey: ['getApplicationForm', id, userType],
    queryFn: () => getApplicationForm(id, userType),
  });
};

export const useGetSurveyForm = (
  expoId: string,
  userType: 'STANDARD' | 'TRAINEE',
) => {
  return useQuery<ApplicationForm, Error>({
    queryKey: ['getSurveyForm', expoId, userType],
    queryFn: () => getSurveyForm(expoId, userType),
  });
};

export const useGetForm = (
  id: string,
  userType: 'STANDARD' | 'TRAINEE',
  formType: 'application' | 'survey',
) => {
  return formType === 'application'
    ? useGetApplicationForm(id, userType)
    : useGetSurveyForm(id, userType);
};
