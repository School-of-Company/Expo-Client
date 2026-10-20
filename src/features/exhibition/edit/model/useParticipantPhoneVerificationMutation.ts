import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { patchParticipantPhoneVerification } from '@/shared/api';
import { ExpoDetail } from '@/shared/types/exhibition/detail/type';

export const useParticipantPhoneVerificationMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (required: boolean) =>
      patchParticipantPhoneVerification(id, required),
    onSuccess: (saved) => {
      // 상세 응답에 이 값이 없는 서버에서도 저장한 값이 화면에 남도록 캐시에 합친다
      queryClient.setQueryData<ExpoDetail>(['expoDetail', id], (prev) =>
        prev
          ? {
              ...prev,
              participantPhoneVerificationRequired:
                saved.participantPhoneVerificationRequired,
            }
          : prev,
      );
      toast.success(
        saved.participantPhoneVerificationRequired
          ? '참가자 휴대전화 본인 인증을 필수로 설정했습니다.'
          : '참가자 휴대전화 본인 인증 없이 신청을 받도록 설정했습니다.',
      );
    },
    onError: (error: Error) => toast.error(error.message),
  });
};
