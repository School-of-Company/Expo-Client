import { useQuery } from '@tanstack/react-query';
import { getApplicationForm } from '../api';
import { ApplicationForm } from '../types/application/type';
import { ApplicationType } from '../types/exhibition/type';

export const useGetApplicationForm = (
  id: string,
  userType: 'STANDARD' | 'TRAINEE',
  application: ApplicationType,
) => {
  return useQuery<ApplicationForm, Error>({
    queryKey: ['getApplicationForm', id, userType, application],
    queryFn: () => getApplicationForm(id, userType, application),
  });
};
