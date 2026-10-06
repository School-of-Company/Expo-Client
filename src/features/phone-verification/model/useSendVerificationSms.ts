import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { mockSendSms as postSendSms } from '../api/mockSms';

export const useSendVerificationSms = (onSuccess: () => void) => {
  return useMutation({
    mutationFn: (phoneNumber: string) => postSendSms(phoneNumber),
    onSuccess: () => {
      onSuccess();
      toast.success('문자 메시지 전송이 완료되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
