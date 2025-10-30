import { useQuery } from '@tanstack/react-query';
import { getSurveyForm } from '../api';
import { ApplicationForm } from '../types/application/type';
import { ApplicationType } from '../types/exhibition/type';

export const useGetSurveyForm = (
  id: string,
  userType: 'STANDARD' | 'TRAINEE',
  ApplicationType: ApplicationType,
) => {
  return useQuery<ApplicationForm, Error>({
    queryKey: ['getSurveyForm', id, userType, ApplicationType],
    queryFn: () => getSurveyForm(id, userType, ApplicationType),
  });
};
