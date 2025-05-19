import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { AttendUserQrRequest } from '@/shared/types/exhibition/check-in/type';
import { patchAttendUser } from '../api/patchAttendUser';

export const usePatchAttendUserMutation = (id: string) => {
  return useMutation({
    mutationFn: (data: AttendUserQrRequest) => patchAttendUser(id, data),
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
