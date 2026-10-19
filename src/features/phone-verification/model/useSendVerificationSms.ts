import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { postParticipantAuthCode } from '../api/participantAuth';

export const useSendVerificationSms = (
  expoId: string,
  onSuccess: (phoneNumber: string) => void,
) => {
  return useMutation({
    mutationFn: (phoneNumber: string) =>
      postParticipantAuthCode(expoId, phoneNumber),
    onSuccess: (_, phoneNumber) => {
      onSuccess(phoneNumber);
      toast.success('문자 메시지 전송이 완료되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
