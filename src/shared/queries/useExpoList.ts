import { useQuery } from '@tanstack/react-query';
import { ExpoItem } from '@/shared/types/admin/type';
import { getExpoList } from '../api/getExpoList';

export const useExpoList = () => {
  return useQuery<ExpoItem[], Error>({
    queryKey: ['expoList'],
    queryFn: getExpoList,
  });
};
