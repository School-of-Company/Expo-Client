import { useQuery } from '@tanstack/react-query';
import { getCheckSmsCode } from '../api/getCheckSmsCode';

export const useCheckSmsCode = (
  phoneNumber: string,
  code: string,
  setIsSmsVerified: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  return useQuery({
    queryKey: ['CheckSmsCode', phoneNumber, code],
    queryFn: async () => {
      const result = await getCheckSmsCode(phoneNumber, code);
      if (typeof result === 'boolean') {
        setIsSmsVerified(result);
      }
      return result;
    },
    enabled: false,
  });
};
