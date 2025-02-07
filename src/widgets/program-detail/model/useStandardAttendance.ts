import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { PatchStandardProgramData } from '@/shared/types/program-detail/type';
import { patchStandardAttendance } from '../api/patchStandardAttendance';

export const useStandardAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PatchStandardProgramData) =>
      patchStandardAttendance(data),
    onSuccess: (_, variables) => {
      toast.success('프로그램 스캔 완료되었습니다.');
      queryClient.invalidateQueries({
        queryKey: ['standardProgramDetail', variables.id],
      });
    },
    onError: () => {
      toast.error('프로그램 스캔 실패했습니다.');
    },
  });
};
