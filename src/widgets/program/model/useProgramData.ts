import { useStandardProgram } from '@/shared/queries/useStandardProgram';
import { useTrainingProgram } from '@/shared/queries/useTrainingProgramQuery';

export const useProgramQueries = (id: string, navigation: string) => {
  const trainingProgramQueries = useTrainingProgram(id);

  const standardProgramQueries = useStandardProgram(
    id,
    navigation === 'standard',
  );

  const programQueries =
    navigation === 'training' ? trainingProgramQueries : standardProgramQueries;

  return { programQueries, isLoading: programQueries.isLoading };
};
