import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { ProgramSessionType } from '../../common/api/ledgerApi';

// Expo-Application-Server 행사별 프로그램 신청 처리 이력
// (GET /application/admin/expos/{expoId}/program-session-applications/activities)
export type AdminApplicationAction = 'APPLIED' | 'CANCELLED' | 'PROMOTED';

export interface AdminApplicationActivity {
  id: number;
  applicationId: string;
  participantId: number;
  programType: ProgramSessionType;
  programId: number;
  /** AdminApplicationAction. 서버가 유형을 늘릴 수 있어 문자열로 받는다 */
  action: string;
  /** 이 이력 시점의 신청 상태 (AdminApplicationStatus) */
  status: string;
  /** 관리자 취소만 기록한다. 신청자·자동 처리와 기록 이전 이력은 null */
  actorId: number | null;
  createdAt: string;
}

/** 처리 시각·id 역순 오프셋 페이지. 페이지는 0부터 */
export interface AdminApplicationActivityPage {
  items: AdminApplicationActivity[];
  totalElements: number;
  page: number;
  size: number;
}

/** from 포함·until 제외, 둘 다 UTC ISO. 서버는 빈 값·모르는 파라미터를 400 으로 거절하므로 값이 있는 것만 보낸다 */
export interface AdminApplicationActivityQuery {
  page: number;
  /** 1–100 */
  size: number;
  action?: AdminApplicationAction;
  applicationId?: string;
  from?: string;
  until?: string;
}

export const getAdminApplicationActivities = async (
  expoId: string,
  query: AdminApplicationActivityQuery,
): Promise<AdminApplicationActivityPage> => {
  try {
    const response = await clientTokenInstance.get(
      `/application/admin/expos/${encodeURIComponent(expoId)}/program-session-applications/activities`,
      // axios 는 undefined 값을 보내지 않는다
      { params: query },
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '신청 처리 이력을 불러오지 못했습니다.');
  }
};
