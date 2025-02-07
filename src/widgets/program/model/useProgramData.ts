import { useQuery } from '@tanstack/react-query';
import { Program } from '@/shared/types/program/type';
import { getStandardProgram, getTrainingProgram } from '../api/getProgramData';

export const useProgramQueries = (id: string, navigation: string) => {
  const trainingProgramQueries = useQuery<Program[], Error>({
    queryKey: ['trainingProgram', id],
    queryFn: () => getTrainingProgram(id),
    enabled: navigation === 'training',
  });
  const standardProgramQueries = useQuery<Program[], Error>({
    queryKey: ['standardProgram', id],
    queryFn: () => getStandardProgram(id),
    enabled: navigation === 'standard',
  });

  const programQueries =
    navigation === 'training' ? trainingProgramQueries : standardProgramQueries;

  return { programQueries, isLoading: programQueries.isLoading };
};
