'use client';

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

  // 프로그램 목록 없이 저장하면 PATCH /expo 가 기존 프로그램을 모두 지우므로 하나라도 실패하면 폼을 열지 않는다
  const queries = [
    expoDetailQuery,
    geoQuery,
    expoStandardQuery,
    expoTrainingQuery,
  ];
  const isError = queries.some((query) => query.isError);
  const refetchFailed = () =>
    queries
      .filter((query) => query.isError)
      .forEach((query) => query.refetch());

  return {
    expoDetailQuery,
    geoQuery,
    expoStandardQuery,
    expoTrainingQuery,
    isLoading,
    isError,
    refetchFailed,
  };
};
