import { QueryClient } from '@tanstack/react-query';

// 대표 번호(세션)에 묶여 서버가 세션별로 돌려주는 조회 캐시. 세션이 바뀌거나 해제되면 이전 대표자 것이 남으면 안 된다
const PARTICIPANT_BOUND_QUERY_KEYS = [
  'myApplications',
  'myPreRegisterWaitlist',
  'participantQr',
  'programParticipants',
];

export const removeParticipantCaches = (queryClient: QueryClient) =>
  PARTICIPANT_BOUND_QUERY_KEYS.forEach((key) =>
    queryClient.removeQueries({ queryKey: [key] }),
  );
