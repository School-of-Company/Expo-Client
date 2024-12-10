import { useQuery } from '@tanstack/react-query';
import {
  ExpoDetail,
  ExpoStandard,
  ExpoTrainingDetail,
} from '@/shared/types/expo-detail/type';
import {
  getExpoDetail,
  getExpoStandard,
  getExpoTraining,
} from '../api/getExpoDetail';

interface ExpoTraining {
  essential: ExpoTrainingDetail[];
  choice: ExpoTrainingDetail[];
}

export const useExpoQueries = (id: number) => {
  const expoDetailQuery = useQuery<ExpoDetail, Error>({
    queryKey: ['expoDetail', id],
    queryFn: () => getExpoDetail(id),
  });

  const expoStandardQuery = useQuery<ExpoStandard[], Error>({
    queryKey: ['expoStandard', id],
    queryFn: () => getExpoStandard(id),
  });

  const expoTrainingQuery = useQuery<ExpoTrainingDetail[], Error, ExpoTraining>(
    {
      queryKey: ['expoTraining', id],
      queryFn: () => getExpoTraining(id),
      select: (data) => ({
        essential: data.filter((item) => item.category === 'ESSENTIAL'),
        choice: data.filter((item) => item.category === 'CHOICE'),
      }),
    },
  );

  const isLoading =
    expoDetailQuery.isLoading ||
    expoStandardQuery.isLoading ||
    expoTrainingQuery.isLoading;

  return { expoDetailQuery, expoStandardQuery, expoTrainingQuery, isLoading };
};
