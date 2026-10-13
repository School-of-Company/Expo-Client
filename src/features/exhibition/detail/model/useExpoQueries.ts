import {
  useExpoDetail,
  useStandardProgram,
  useTrainingProgram,
} from '@/shared/queries';

export const useExpoQueries = (id: string) => {
  const expoDetailQuery = useExpoDetail(id);
  const expoStandardQuery = useStandardProgram(id);
  const expoTrainingQuery = useTrainingProgram(id);

  const isLoading =
    expoDetailQuery.isLoading ||
    expoStandardQuery.isLoading ||
    expoTrainingQuery.isLoading;

  const queries = [expoDetailQuery, expoStandardQuery, expoTrainingQuery];
  const isError = queries.some((query) => query.isError);
  const refetchFailed = () =>
    queries
      .filter((query) => query.isError)
      .forEach((query) => query.refetch());

  return {
    expoDetailQuery,
    expoStandardQuery,
    expoTrainingQuery,
    isLoading,
    isError,
    refetchFailed,
  };
};
