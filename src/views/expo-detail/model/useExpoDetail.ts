import { useExpoDetail } from '@/shared/queries/useExpoDetail';
import { useStandardProgram } from '@/shared/queries/useStandardProgram';
import { useTrainingProgram } from '@/shared/queries/useTrainingProgramQuery';

export const useExpoQueries = (id: string) => {
  const expoDetailQuery = useExpoDetail(id);
  const expoStandardQuery = useStandardProgram(id);
  const expoTrainingQuery = useTrainingProgram(id);

  const isLoading =
    expoDetailQuery.isLoading ||
    expoStandardQuery.isLoading ||
    expoTrainingQuery.isLoading;

  return {
    expoDetailQuery,
    expoStandardQuery,
    expoTrainingQuery,
    isLoading,
  };
};
