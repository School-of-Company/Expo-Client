import { useQuery } from '@tanstack/react-query';
import { getCheckSmsCode } from '../api/getCheckSmsCode';

export const useCheckSmsCode = (phoneNumber: string, code: string) => {
  return useQuery({
    queryKey: ['CheckSmsCode', phoneNumber, code],
    queryFn: () => getCheckSmsCode(phoneNumber, code),
    enabled: false,
  });
};
