import { useQuery } from '@tanstack/react-query';
import { ExpoItem } from '@/shared/types/main/type';
import { getForm } from '../api/getForm';

export const useGetForm = (id: string, type: string) => {
  return useQuery<ExpoItem[], Error>({
    queryKey: ['expoList', id, type],
    queryFn: () => getForm(id, type),
  });
};
