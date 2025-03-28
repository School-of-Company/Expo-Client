import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { postSendSms } from '../api/postSendSms';

export const useSendSms = (
  setTimer: React.Dispatch<React.SetStateAction<number>>,
  setIsSmsSent: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  return useMutation({
    mutationFn: (phoneNumber: string) => postSendSms(phoneNumber),
    onSuccess: () => {
      setIsSmsSent(true);
      setTimer(180);
      toast.success('문자 메시지 전송이 완료되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
