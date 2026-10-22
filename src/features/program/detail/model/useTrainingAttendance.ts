import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { PatchTrainingProgramData } from '@/shared/types/program/detail/type';
import { patchTrainingAttendance } from '../api/patchTrainingAttendance';

export const useTrainingAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PatchTrainingProgramData) =>
      patchTrainingAttendance(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['trainingProgramDetail', variables.programId],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
