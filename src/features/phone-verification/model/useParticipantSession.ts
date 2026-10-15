import { useQuery } from '@tanstack/react-query';
import { getParticipantSession } from '../api/participantAuth';

/** 이미 인증한 세션이 있으면 다시 인증하지 않고 넘어갈 수 있다 */
export const useParticipantSession = (expoId: string | null) =>
  useQuery({
    queryKey: ['participantSession', expoId],
    queryFn: () => getParticipantSession(expoId!),
    enabled: expoId !== null,
    // 세션 확인 실패는 화면에서 인증을 진행하면 되므로 토스트를 띄우지 않는다
    meta: { silent: true },
    retry: false,
  });
