import { useMutation } from '@tanstack/react-query';
import { mockCheckSmsCode as getCheckSmsCode } from '../api/mockSms';

export const useVerifySmsCode = (onVerified: (phoneNumber: string) => void) => {
  return useMutation({
    mutationFn: ({
      phoneNumber,
      code,
    }: {
      phoneNumber: string;
      code: string;
    }) => getCheckSmsCode(phoneNumber, code),
    onSuccess: (isVerified, { phoneNumber }) => {
      if (isVerified) onVerified(phoneNumber);
    },
  });
};
