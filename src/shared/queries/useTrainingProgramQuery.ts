import { useQuery } from '@tanstack/react-query';
import { getTrainingProgram } from '../api';
import { Program } from '../types/program/type';

type SelectedTrainingProgram = {
  essential: Program[];
  choice: Program[];
};

export const useTrainingProgram = (
  id: string,
  options?: {
    enabled?: boolean;
    selectEssentialChoice?: boolean;
  },
) => {
  const { enabled = true, selectEssentialChoice = false } = options || {};

  return useQuery<Program[], Error, Program[] | SelectedTrainingProgram>({
    queryKey: ['trainingProgram', id],
    queryFn: () => getTrainingProgram(id),
    enabled,
    select: selectEssentialChoice
      ? (data) => ({
          essential: data.filter((item) => item.category === 'ESSENTIAL'),
          choice: data.filter((item) => item.category === 'CHOICE'),
        })
      : undefined,
  });
};
