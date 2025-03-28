import { useQuery } from '@tanstack/react-query';
import { ExpoItem } from '@/shared/types/main/type';
import { getExpoList } from '../api/getExpoList';

export const useExpoList = () => {
  return useQuery<ExpoItem[], Error>({
    queryKey: ['expoList'],
    queryFn: getExpoList,
  });
};
