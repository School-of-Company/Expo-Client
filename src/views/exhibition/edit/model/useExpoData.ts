import { useQuery } from '@tanstack/react-query';
import { useExpoDetail } from '@/shared/queries/useExpoDetail';
import { useStandardProgram } from '@/shared/queries/useStandardProgram';
import { useTrainingProgram } from '@/shared/queries/useTrainingProgramQuery';
import { AddressResponse } from '@/shared/types/exhibition/edit/type';
import { ExpoTrainingDetail } from '@/shared/types/expo-detail/type';
import { getAddress } from '../api/getAddress';

export const useExpoData = (id: string) => {
  const expoDetailQuery = useExpoDetail(id);

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

  const expoStandardQuery = useStandardProgram(id);
  const expoTrainingQuery = useTrainingProgram(id, {
    selectEssentialChoice: true,
  }) as ReturnType<typeof useTrainingProgram> & {
    data: {
      essential: ExpoTrainingDetail[];
      choice: ExpoTrainingDetail[];
    };
  };

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
