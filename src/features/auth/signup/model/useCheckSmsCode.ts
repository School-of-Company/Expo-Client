import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getCheckSmsCode } from '@/shared/api';

export const useCheckSmsCode = (
  setIsSmsVerified: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  return useMutation({
    mutationFn: ({
      phoneNumber,
      code,
    }: {
      phoneNumber: string;
      code: string;
    }) => getCheckSmsCode(phoneNumber, code),
    onSuccess: () => {
      setIsSmsVerified(true);
      toast.success('인증 번호 확인에 성공했습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
