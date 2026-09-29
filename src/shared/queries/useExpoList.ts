import { useQuery } from '@tanstack/react-query';
import { ExpoItem } from '@/shared/types/admin/type';
import { getExpoList, getExpoPage } from '../api/getExpoList';

export const useExpoList = (enabled = true) => {
  return useQuery<ExpoItem[], Error>({
    queryKey: ['expoList'],
    queryFn: getExpoList,
    enabled,
  });
};

export const useExpoPage = (page: number, size = 20, enabled = true) =>
  useQuery({
    queryKey: ['expoList', 'page', page, size],
    queryFn: () => getExpoPage(page, size),
    enabled,
  });
