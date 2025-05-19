import { useStandardProgram, useTrainingProgram } from '@/shared/queries';

export const useProgramQueries = (expoId: string, navigation: string) => {
  const trainingProgramQueries = useTrainingProgram(expoId);

  const standardProgramQueries = useStandardProgram(
    expoId,
    navigation === 'standard',
  );

  const programQueries =
    navigation === 'training' ? trainingProgramQueries : standardProgramQueries;

  return { programQueries, isLoading: programQueries.isLoading };
};
