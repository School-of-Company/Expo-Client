'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { SendSmSData } from '@/shared/types/sms';
import { sendSMS } from '../api/sendSMS';

export const useSendSMS = (id: string, authority: 'STANDARD' | 'TRAINEE') => {
  return useMutation({
    mutationFn: (data: SendSmSData) => sendSMS(id, authority, data),
    onSuccess: () => {
      toast.success('문자가 성공적으로 전송되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
