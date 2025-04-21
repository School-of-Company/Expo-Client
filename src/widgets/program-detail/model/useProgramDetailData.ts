import { useQuery } from '@tanstack/react-query';
import {
  StandardProgram,
  TrainingProgram,
} from '@/shared/types/program-detail/type';
import {
  getStandardProgramDetail,
  getTrainingProgramDetail,
} from '../api/getProgramDetailData';

export const useProgramDetailQueries = (id: string, navigation: string) => {
  const trainingProgramDetailQueries = useQuery<TrainingProgram[], Error>({
    queryKey: ['trainingProgramDetail', id],
    queryFn: () => getTrainingProgramDetail(id),
    enabled: navigation === 'training',
  });
  const standardProgramDetailQueries = useQuery<StandardProgram[], Error>({
    queryKey: ['standardProgramDetail', id],
    queryFn: () => getStandardProgramDetail(id),
    enabled: navigation === 'standard',
  });

  const programDetailQueries =
    navigation === 'training'
      ? trainingProgramDetailQueries
      : standardProgramDetailQueries;

  return { programDetailQueries, isLoading: programDetailQueries.isLoading };
};
