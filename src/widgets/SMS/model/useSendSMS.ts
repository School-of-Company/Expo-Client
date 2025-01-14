'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { sendSMS } from '../api/sendSMS';

interface FormData {
  title: string;
  content: string;
}

export function useSendSMS(id: string, authority: 'STANDARD' | 'TRAINEE') {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: FormData) => sendSMS({ ...data, id, authority }),
    onSuccess: () => {
      toast.success('문자가 성공적으로 전송되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
    },
    onError: (error: Error) => {
      toast.error(`문자 전송 실패: ${error.message}`);
    },
  });

  return mutation;
}
