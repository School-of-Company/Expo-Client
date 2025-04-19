import { useQuery } from '@tanstack/react-query';
import { getStandardProgram } from '../api';
import { Program } from '../types/program/type';

export const useStandardProgram = (id: string, enabled = true) => {
  return useQuery<Program[], Error>({
    queryKey: ['standardProgram', id],
    queryFn: () => getStandardProgram(id),
    enabled,
  });
};
