import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { PatchStandardProgramData } from '@/shared/types/program-detail/type';
import { patchStandardAttendance } from '../api/patchStandardAttendance';

export const useStandardAttendance = () => {
  return useMutation({
    mutationFn: (data: PatchStandardProgramData) =>
      patchStandardAttendance(data),
    onSuccess: () => {
      toast.success('프로그램 스캔 완료되었습니다.');
    },
    onError: () => {
      toast.error('프로그램 스캔 실패했습니다.');
    },
  });
};
