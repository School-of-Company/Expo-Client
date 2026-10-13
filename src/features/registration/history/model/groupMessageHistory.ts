import { useInfiniteQuery } from '@tanstack/react-query';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import { getGroupMessageHistory } from '../api/groupMessageHistoryApi';
import { HistoryFilter, toUtcIso } from './adminChangeHistory';

export const MESSAGE_HISTORY_LIMIT = 20;

const MESSAGE_TYPE_LABEL: Record<string, string> = {
  REQUESTED: '발송 요청',
  SENT: '발송 완료',
  FAILED: '발송 실패',
  RETRIED: '재시도',
};

// 모르는 유형·상태는 서버 값을 그대로 보여 준다
export const getMessageTypeLabel = (type: string) =>
  MESSAGE_TYPE_LABEL[type] ?? type;

/** 기간(from 포함·to 제외)만 모집 변경 이력과 같이 쓴다. 유형 필터는 변경 이력 전용이다 */
export const useGroupMessageHistory = (
  expoId: string,
  { from, to }: HistoryFilter,
  enabled: boolean,
) =>
  useInfiniteQuery({
    queryKey: ['groupMessageHistory', expoId, from, to],
    queryFn: ({ pageParam }) =>
      getGroupMessageHistory(expoId, {
        from: toUtcIso(from),
        to: toUtcIso(to),
        limit: MESSAGE_HISTORY_LIMIT,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: ({ nextCursor }) => nextCursor || undefined,
    enabled,
  });

export const getMessageHistoryErrorMessage = (error: unknown) => {
  switch (getErrorStatus(error)) {
    case 400:
      return '조회 조건이 올바르지 않습니다.';
    case 401:
      return '로그인이 만료되었습니다. 다시 로그인해주세요.';
    case 403:
      return '문자 발송 이력을 조회할 권한이 없습니다.';
    case 502:
    case 503:
      return '문자 이력 원천에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
    default:
      return '문자 발송 이력을 불러오지 못했습니다.';
  }
};
