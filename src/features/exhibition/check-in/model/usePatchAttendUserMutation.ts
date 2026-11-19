import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useScanHttp } from '@/shared/libs/http/ScanHttpContext';
import { AttendUserQrRequest } from '@/shared/types/exhibition/check-in/type';
import { patchAttendUser } from '../api/patchAttendUser';

export const usePatchAttendUserMutation = (
  id: string,
  scannerName?: string,
) => {
  const http = useScanHttp();
  return useMutation({
    mutationFn: (data: AttendUserQrRequest) =>
      patchAttendUser(id, data, scannerName, http),
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
