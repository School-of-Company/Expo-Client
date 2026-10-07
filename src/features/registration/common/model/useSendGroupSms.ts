import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { RegistrationGroupSmsRequest } from '@/shared/types/registration/type';
import { mockPostRegistrationGroupSms as postRegistrationGroupSms } from '../api/mockRegistration';

export const useSendGroupSms = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegistrationGroupSmsRequest) =>
      postRegistrationGroupSms(data),
    onSuccess: ({ sentCount }) => {
      void queryClient.invalidateQueries({
        queryKey: ['registrationHistories'],
      });
      toast.success(`${sentCount}건의 문자를 발송했습니다.`);
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
