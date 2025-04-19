import { useQuery } from '@tanstack/react-query';
import { getSurveyForm } from '../api';
import { ApplicationForm } from '../types/application/type';

export const useGetSurveyForm = (
  id: string,
  userType: 'STANDARD' | 'TRAINEE',
) => {
  return useQuery<ApplicationForm, Error>({
    queryKey: ['getSurveyForm', id, userType],
    queryFn: () => getSurveyForm(id, userType),
  });
};
