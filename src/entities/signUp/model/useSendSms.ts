import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { postSendSms } from '../api/postSendSms';

export const useSendSms = (
  setIsSmsSent: React.Dispatch<React.SetStateAction<boolean>>,
  setTimer: React.Dispatch<React.SetStateAction<number>>,
) => {
  return useMutation({
    mutationFn: (phoneNumber: string) => postSendSms(phoneNumber),
    onSuccess: () => {
      setIsSmsSent(true);
      setTimer(180);
      toast.success('문자 메시지 전송이 완료되었습니다.');
    },
    onError: () => {
      toast.error('문제 매시지 전송에 실패했습니다.');
    },
  });
};
