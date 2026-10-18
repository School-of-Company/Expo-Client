import { useQuery } from '@tanstack/react-query';
import { getParticipantSession } from '../api/participantAuth';

/**
 * 이미 인증한 세션이 있으면 다시 인증하지 않고 넘어갈 수 있다.
 * `alwaysRefetch` 는 남아 있는 결과 대신 들어올 때마다 서버에 다시 묻는다(인증을 강제하는 화면용).
 */
export const useParticipantSession = (
  expoId: string | null,
  { alwaysRefetch = false }: { alwaysRefetch?: boolean } = {},
) =>
  useQuery({
    queryKey: ['participantSession', expoId],
    queryFn: () => getParticipantSession(expoId!),
    enabled: expoId !== null,
    refetchOnMount: alwaysRefetch ? 'always' : true,
    // 세션 확인 실패는 화면에서 인증을 진행하면 되므로 토스트를 띄우지 않는다
    meta: { silent: true },
    retry: false,
  });
