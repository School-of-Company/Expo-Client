import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useScanHttp } from '@/shared/libs/http/ScanHttpContext';
import { PatchStandardProgramData } from '@/shared/types/program/detail/type';
import { patchStandardAttendance } from '../api/patchStandardAttendance';

export const useStandardAttendance = () => {
  const queryClient = useQueryClient();
  const http = useScanHttp();

  return useMutation({
    mutationFn: (data: PatchStandardProgramData) =>
      patchStandardAttendance(data, http),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['standardProgramDetail', variables.programId],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
