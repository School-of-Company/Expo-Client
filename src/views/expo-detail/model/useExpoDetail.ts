import { useExpoDetail } from '@/shared/queries/useExpoDetail';
import { useStandardProgram } from '@/shared/queries/useStandardProgram';
import { useTrainingProgram } from '@/shared/queries/useTrainingProgramQuery';
import { ExpoTrainingDetail } from '@/shared/types/expo-detail/type';

export const useExpoQueries = (id: string) => {
  const expoDetailQuery = useExpoDetail(id);
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
    expoStandardQuery.isLoading ||
    expoTrainingQuery.isLoading;

  return {
    expoDetailQuery,
    expoStandardQuery,
    expoTrainingQuery,
    isLoading,
  };
};
