import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { ExitScanRequest } from '@/shared/types/exhibition/check-in/entry';
import { patchExitUser } from '../api/patchExitUser';

const SUBJECT_LABEL = {
  STANDARD: '참가자',
  TRAINEE: '연수자',
  PAPER_QR: '종이 QR',
} as const;

export const useExitUserMutation = (expoId: string, scannerName?: string) =>
  useMutation({
    mutationFn: (data: ExitScanRequest) =>
      patchExitUser(expoId, data, scannerName),
    onSuccess: ({ subjectType, enteredTime, exitedTime, stayedMinutes }) => {
      toast.success(
        `${SUBJECT_LABEL[subjectType] ?? ''} 퇴장 처리: ${enteredTime} 입장 → ${exitedTime} 퇴장 (${stayedMinutes}분)`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
