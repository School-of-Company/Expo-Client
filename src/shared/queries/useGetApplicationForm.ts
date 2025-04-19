import { useQuery } from '@tanstack/react-query';
import { getApplicationForm } from '../api';
import { ApplicationForm } from '../types/application/type';

export const useGetApplicationForm = (
  id: string,
  userType: 'STANDARD' | 'TRAINEE',
) => {
  return useQuery<ApplicationForm, Error>({
    queryKey: ['getApplicationForm', id, userType],
    queryFn: () => getApplicationForm(id, userType),
  });
};
