import { useQuery } from '@tanstack/react-query';
import { ApplicationForm } from '@/shared/types/application/type';

import { getForm } from '../api/getForm';

export const useGetForm = (id: string, type: string) => {
  return useQuery<ApplicationForm, Error>({
    queryKey: ['expoList', id, type],
    queryFn: () => getForm(id, type),
  });
};
