import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';

// 행사별 모집·회차 변경 처리 이력 (Application GET /application/admin/expos/{expoId}/recruitment-history)
export type AdminChangeType =
  | 'PROGRAM_CREATE'
  | 'PROGRAM_UPDATE'
  | 'PROGRAM_DELETE'
  | 'SESSION_CREATE'
  | 'SESSION_UPDATE'
  | 'SESSION_DELETE';

export interface AdminChangeHistoryItem {
  id: number;
  /** AdminChangeType. 서버가 유형을 늘릴 수 있어 문자열로 받는다 */
  type: string;
  /** 처리자를 기록하지 못한 이력은 null */
  adminId: number | null;
  occurredAt: string;
  targetType: string;
  targetId: number;
  summary: string;
}

/** 응답에 totalPages 가 없다. 화면에서 totalElements 와 size 로 계산한다 */
export interface AdminChangeHistoryPage {
  expoId: string;
  items: AdminChangeHistoryItem[];
  page: number;
  size: number;
  totalElements: number;
}

/** from 포함·to 제외, 둘 다 UTC ISO. 서버는 빈 파라미터를 거절하므로 값이 있는 것만 보낸다 */
export interface AdminChangeHistoryQuery {
  page: number;
  /** 1–100 */
  size: number;
  type?: AdminChangeType;
  from?: string;
  to?: string;
}

const compactParams = (params: object) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== '',
    ),
  );

export const getAdminChangeHistory = async (
  expoId: string,
  query: AdminChangeHistoryQuery,
): Promise<AdminChangeHistoryPage> => {
  try {
    const response = await clientTokenInstance.get(
      `/application/admin/expos/${encodeURIComponent(expoId)}/recruitment-history`,
      { params: compactParams(query) },
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '변경 이력을 불러오지 못했습니다.');
  }
};
