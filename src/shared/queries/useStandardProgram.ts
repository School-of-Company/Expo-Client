import { useQuery } from '@tanstack/react-query';
import { getStandardProgram } from '../api';
import { Program } from '../types/program/list/type';
import { programQueryKeys } from './programQueryKeys';

export const useStandardProgram = (id: string, enabled = true) => {
  return useQuery<Program[], Error>({
    queryKey: programQueryKeys.standard(id),
    queryFn: () => getStandardProgram(id),
    enabled,
  });
};
