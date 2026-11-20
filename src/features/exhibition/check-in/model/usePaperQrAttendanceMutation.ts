import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useScanHttp } from '@/shared/libs/http/ScanHttpContext';
import { patchPaperQrAttendance } from '../api/patchPaperQrAttendance';

export const usePaperQrAttendanceMutation = (
  expoId: string,
  scannerName?: string,
) => {
  const http = useScanHttp();
  return useMutation({
    mutationFn: (token: string) =>
      patchPaperQrAttendance(expoId, token, scannerName, http),
    onSuccess: ({ entryStatus }) => {
      toast.success(
        entryStatus === 'RE_ENTRY'
          ? '종이 QR 재입장이 확인되었습니다.'
          : '종이 QR 입장이 확인되었습니다.',
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
