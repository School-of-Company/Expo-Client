import { useQuery } from '@tanstack/react-query';
import { getExpoDetail, getExpoStandard, getExpoTraining } from '@/shared/api';
import { AddressResponse } from '@/shared/types/exhibition/edit/type';
import {
  ExpoDetail,
  ExpoStandard,
  ExpoTrainingDetail,
} from '@/shared/types/expo-detail/type';
import { getAddress } from '../api/getAddress';

interface ExpoTraining {
  essential: ExpoTrainingDetail[];
  choice: ExpoTrainingDetail[];
}

export const useExpoData = (id: string) => {
  const expoDetailQuery = useQuery<ExpoDetail, Error>({
    queryKey: ['expoDetail', id],
    queryFn: () => getExpoDetail(id),
  });

  const geoQuery = useQuery<AddressResponse, Error>({
    queryKey: [
      'convertedGeo',
      expoDetailQuery.data?.x,
      expoDetailQuery.data?.y,
    ],
    queryFn: () =>
      getAddress(
        String(expoDetailQuery.data?.y),
        String(expoDetailQuery.data?.x),
      ),

    enabled: !!expoDetailQuery.data,
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
    geoQuery.isLoading ||
    expoStandardQuery.isLoading ||
    expoTrainingQuery.isLoading;

  return {
    expoDetailQuery,
    geoQuery,
    expoStandardQuery,
    expoTrainingQuery,
    isLoading,
  };
};
