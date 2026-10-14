import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { deleteParticipantSession } from '../api/participantAuth';

/** 세션을 지우고 세션 상태를 다시 불러와 인증 화면을 처음 상태로 돌린다 */
export const useLogoutParticipantSession = (expoId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteParticipantSession,
    onSuccess: () => {
      toast.success('인증을 해제했습니다. 다른 번호로 인증해주세요.');
      // 앞사람 신청 내역이 다음 사람에게 보이지 않도록 다시 불러오는 대신 지운다(박람회 구분 없이)
      queryClient.removeQueries({ queryKey: ['myApplications'] });
      return queryClient.invalidateQueries({
        queryKey: ['participantSession', expoId],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
