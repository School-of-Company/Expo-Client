import { useQuery } from '@tanstack/react-query';
import { getTrainingProgram } from '../api';
import { Program } from '../types/program/list/type';

export const useTrainingProgram = (id: string) => {
  return useQuery<Program[], Error>({
    queryKey: ['trainingProgram', id],
    queryFn: () => getTrainingProgram(id),
  });
};
