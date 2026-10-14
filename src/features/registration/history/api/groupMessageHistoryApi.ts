import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { ProgramSessionType } from '../../common/api/ledgerApi';

// Expo-Application-Server 행사별 그룹 문자 처리 이력. 원천은 Notification
// (GET /application/expos/{expoId}/admin-group-messages/history)
export type AdminMessageHistoryType =
  | 'REQUESTED'
  | 'SENT'
  | 'FAILED'
  | 'RETRIED';

/** 이벤트 당시 값. 본문·전화번호·대상 ID 는 포함하지 않는다 */
export interface AdminMessageHistoryItem {
  eventId: string;
  /** AdminMessageHistoryType. 서버가 유형을 늘릴 수 있어 문자열로 받는다 */
  type: string;
  /** 조회자가 아니라 작업을 요청·재시도한 관리자 */
  adminId: number;
  occurredAt: string;
  targetScope: {
    kind: string;
    /** 이력 기록 전에 만든 작업은 null */
    applicationCount: number | null;
    programTypes: ProgramSessionType[];
  };
  counts: {
    total: number;
    /** PENDING + SENDING */
    pending: number;
    accepted: number;
    delivered: number;
    failed: number;
    unknown: number;
    missing: number;
  };
  /** 이벤트 당시 작업 상태 (GroupMessageJobStatus) */
  status: string;
  jobId: string;
}

/** 추가 행이 없으면 nextCursor 를 생략한다. 전체 건수는 주지 않는다 */
export interface AdminMessageHistoryPage {
  items: AdminMessageHistoryItem[];
  nextCursor?: string | null;
}

/** from 포함·to 제외, 둘 다 UTC ISO. cursor 는 앞 페이지 nextCursor 를 그대로 보낸다 */
export interface AdminMessageHistoryQuery {
  /** 1–100 */
  limit: number;
  cursor?: string;
  type?: AdminMessageHistoryType;
  from?: string;
  to?: string;
}

export const getAdminMessageHistory = async (
  expoId: string,
  query: AdminMessageHistoryQuery,
): Promise<AdminMessageHistoryPage> => {
  try {
    const response = await clientTokenInstance.get(
      `/application/expos/${encodeURIComponent(expoId)}/admin-group-messages/history`,
      // axios 는 undefined 값을 보내지 않는다
      { params: query },
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '문자 발송 이력을 불러오지 못했습니다.');
  }
};
