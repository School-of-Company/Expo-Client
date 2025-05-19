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
      toast.success('프로그램 스캔 완료되었습니다.');
      queryClient.invalidateQueries({
        queryKey: ['trainingProgramDetail', variables.programId],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
