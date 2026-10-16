import { useStandardProgram, useTrainingProgram } from '@/shared/queries';

export const useProgramQueries = (expoId: string, navigation: string) => {
  // 보고 있는 탭의 목록만 읽는다
  const trainingProgramQueries = useTrainingProgram(
    expoId,
    navigation === 'training',
  );

  const standardProgramQueries = useStandardProgram(
    expoId,
    navigation === 'standard',
  );

  const programQueries =
    navigation === 'training' ? trainingProgramQueries : standardProgramQueries;

  return { programQueries, isLoading: programQueries.isLoading };
};
