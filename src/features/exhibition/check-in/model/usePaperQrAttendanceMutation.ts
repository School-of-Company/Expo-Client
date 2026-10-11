import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { patchPaperQrAttendance } from '../api/patchPaperQrAttendance';

export const usePaperQrAttendanceMutation = (expoId: string) => {
  return useMutation({
    mutationFn: (token: string) => patchPaperQrAttendance(expoId, token),
    onSuccess: () => {
      toast.success('종이 QR 입장이 확인되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
