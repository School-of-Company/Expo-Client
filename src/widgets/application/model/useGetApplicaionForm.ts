import { useQuery } from '@tanstack/react-query';
import { ApplicationForm } from '@/shared/types/application/type';
import { getApplicationForm } from '../api/getApplicationForm';

export const useGetApplicaionForm = (id: string, type: string) => {
  return useQuery<ApplicationForm, Error>({
    queryKey: ['getApplicationForm', id, type],
    queryFn: () => getApplicationForm(id, type),
  });
};
