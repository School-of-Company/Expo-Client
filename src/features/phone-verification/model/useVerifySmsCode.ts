import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { postParticipantAuthVerify } from '../api/participantAuth';

/** 인증에 성공하면 서버가 참가자 세션 쿠키를 발급한다 */
export const useVerifySmsCode = (
  expoId: string,
  onVerified: (phoneNumber: string) => void,
) => {
  return useMutation({
    mutationFn: ({
      phoneNumber,
      code,
    }: {
      phoneNumber: string;
      code: string;
    }) => postParticipantAuthVerify(expoId, phoneNumber, code),
    onSuccess: (_session, { phoneNumber }) => {
      toast.success('인증 번호 확인에 성공했습니다.');
      onVerified(phoneNumber);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
