import { useQuery } from '@tanstack/react-query';
import { useExpoDetail } from '@/shared/queries/useExpoDetail';
import { useStandardProgram } from '@/shared/queries/useStandardProgram';
import { useTrainingProgram } from '@/shared/queries/useTrainingProgramQuery';
import { AddressResponse } from '@/shared/types/exhibition/edit/type';
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
  const expoTrainingQuery = useTrainingProgram(id);

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
