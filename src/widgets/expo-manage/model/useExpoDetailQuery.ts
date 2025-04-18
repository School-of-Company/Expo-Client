import { useQuery } from '@tanstack/react-query';
import { getExpoDetail } from '@/shared/api';
import { ExpoDetail } from '@/shared/types/expo-detail/type';

export const useGetExpoDetailQuery = (id: string) => {
  return useQuery<ExpoDetail, Error>({
    queryKey: ['expoDetail', id],
    queryFn: () => getExpoDetail(id),
  });
};
