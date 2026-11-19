import { isForbiddenError } from '@/shared/libs/http/apiError';
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
  // 운영진이 아닌 박람회는 다시 시도해도 같아 안내만 바꾼다
  const isForbidden = queries.some((query) => isForbiddenError(query.error));
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
    isForbidden,
    refetchFailed,
  };
};
