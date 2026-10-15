import { useInfiniteQuery } from '@tanstack/react-query';
import { ApiError, getErrorStatus } from '@/shared/libs/http/apiError';
import {
  AdminMessageHistoryItem,
  AdminMessageHistoryType,
  getAdminMessageHistory,
} from '../api/groupMessageHistoryApi';

export const MESSAGE_HISTORY_PAGE_SIZE = 20;

export const MESSAGE_HISTORY_TYPE_LABEL: Record<
  AdminMessageHistoryType,
  string
> = {
  REQUESTED: '발송 요청',
  SENT: '발송 완료',
  FAILED: '실패 포함 종료',
  RETRIED: '실패 재발송',
};

const MESSAGE_HISTORY_TYPE_STYLE: Record<AdminMessageHistoryType, string> = {
  REQUESTED: 'text-black',
  SENT: 'text-main-600',
  FAILED: 'text-error',
  RETRIED: 'text-black',
};

const isMessageHistoryType = (type: string): type is AdminMessageHistoryType =>
  type in MESSAGE_HISTORY_TYPE_LABEL;

// 모르는 유형은 서버 값을 그대로 보여 준다
export const getMessageHistoryTypeLabel = (type: string) =>
  isMessageHistoryType(type) ? MESSAGE_HISTORY_TYPE_LABEL[type] : type;

export const getMessageHistoryTypeStyle = (type: string) =>
  isMessageHistoryType(type)
    ? MESSAGE_HISTORY_TYPE_STYLE[type]
    : 'text-gray-500';

/** 화면 행. 표는 id 를 키로 쓰므로 eventId 를 옮겨 둔다 */
export type MessageHistoryRow = AdminMessageHistoryItem & { id: string };

/** 커서 페이지를 "더 보기"로 이어 붙인다. 전체 건수는 서버가 주지 않는다 */
export const useAdminMessageHistory = (expoId: string) =>
  useInfiniteQuery({
    queryKey: ['adminMessageHistory', expoId],
    queryFn: ({ pageParam }) =>
      getAdminMessageHistory(expoId, {
        limit: MESSAGE_HISTORY_PAGE_SIZE,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: ({ nextCursor }) => nextCursor ?? undefined,
    select: ({ pages }): MessageHistoryRow[] =>
      pages.flatMap(({ items }) =>
        items.map((item) => ({ ...item, id: item.eventId })),
      ),
  });

/** 502 는 Notification 응답 계약 오류, 503 은 권한 확인·Notification 연결 장애다 */
export const getMessageHistoryErrorMessage = (error: unknown) => {
  switch (getErrorStatus(error)) {
    case 400:
      return error instanceof ApiError
        ? error.message
        : '조회 조건이 올바르지 않습니다.';
    case 401:
      return '로그인이 만료되었습니다. 다시 로그인해주세요.';
    case 403:
      return '문자 발송 이력을 조회할 권한이 없습니다.';
    case 404:
      return '박람회를 찾을 수 없습니다.';
    case 502:
    case 503:
      return '지금은 문자 발송 이력을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.';
    default:
      return '문자 발송 이력을 불러오지 못했습니다.';
  }
};
