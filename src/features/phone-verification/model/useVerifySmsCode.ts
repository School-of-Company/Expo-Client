import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { postParticipantAuthVerify } from '../api/participantAuth';

/** 인증에 성공하면 서버가 참가자 세션 쿠키를 발급한다 */
export const useVerifySmsCode = (
  expoId: string,
  onVerified: (phoneNumber: string) => void,
) => {
  const queryClient = useQueryClient();

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
      // 인증 전 "세션 없음" 결과가 남아 있으면 돌아왔을 때 다시 인증하라고 보이므로 새로 불러오게 한다
      queryClient.invalidateQueries({
        queryKey: ['participantSession', expoId],
      });
      onVerified(phoneNumber);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
