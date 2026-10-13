import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';

// Application AdminSourceHistoryController 그룹 문자 처리 이력. 본문·전화번호는 내려오지 않는다
export interface GroupMessageHistoryCounts {
  total: number;
  pending: number;
  accepted: number;
  delivered: number;
  failed: number;
  unknown: number;
  missing: number;
}

export interface GroupMessageHistoryItem {
  eventId: string;
  /** REQUESTED | SENT | FAILED | RETRIED. 서버가 늘릴 수 있어 문자열로 받는다 */
  type: string;
  adminId: number;
  occurredAt: string;
  targetScope: {
    kind: string;
    /** 범위에 따라 서버가 모를 수 있다 */
    applicationCount: number | null;
    programTypes: string[];
  };
  counts: GroupMessageHistoryCounts;
  status: string;
  jobId: string;
}

export interface GroupMessageHistoryPage {
  items: GroupMessageHistoryItem[];
  /** 없으면 마지막 페이지. 다음 요청에는 이 값만 cursor 로 보낸다 */
  nextCursor?: string | null;
}

/** from 포함·to 제외, 시간·eventId 역순. 서버는 빈 파라미터를 거절하므로 값이 있는 것만 보낸다 */
export interface GroupMessageHistoryQuery {
  from?: string;
  to?: string;
  /** 1–100 */
  limit: number;
  cursor?: string;
}

export const getGroupMessageHistory = async (
  expoId: string,
  query: GroupMessageHistoryQuery,
): Promise<GroupMessageHistoryPage> => {
  try {
    const response = await clientTokenInstance.get(
      `/application/expos/${encodeURIComponent(expoId)}/admin-group-messages/history`,
      {
        params: Object.fromEntries(
          Object.entries(query).filter(
            ([, value]) => value !== undefined && value !== '',
          ),
        ),
      },
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '문자 발송 이력을 불러오지 못했습니다.');
  }
};
