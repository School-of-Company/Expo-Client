import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { ProgramSessionType } from '../../common/api/ledgerApi';

// Expo-Application-Server 행사별 프로그램 신청 처리 이력
// (GET /application/admin/expos/{expoId}/program-session-applications/activities)
export type AdminApplicationAction = 'APPLIED' | 'CANCELLED' | 'PROMOTED';
export type AdminApplicationActorType = 'USER' | 'ADMIN' | 'SYSTEM';

// ponytail: 아래 `?` 필드는 서버 #124 계약 확정 전 가정이다. 이름이 다르면 이 파일만 맞춘다
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
  /** 관리자 처리의 관리자 id. 그 외와 기록 이전 이력은 null */
  actorId: number | null;
  /** 처리주체. 기록 이전 이력은 null/없음이며 사용자·자동으로 추정하지 않는다 */
  actorType?: AdminApplicationActorType | null;
  /** 처리 전 상태. 신규 신청처럼 이전 상태가 없으면 null */
  previousStatus?: string | null;
  /** previousStatus 가 기록된 이력인지. false 면 과거 미기록이다 */
  previousStatusRecorded?: boolean;
  /** 처리 당시 참가자·프로그램·회차 표시정보. 없으면 미기록이다 */
  participantName?: string | null;
  programTitle?: string | null;
  sessionTitle?: string | null;
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
  /** 참가자 검색어 */
  participant?: string;
  programType?: ProgramSessionType;
  programId?: number;
  /** 처리 결과 상태 */
  status?: string;
  actorType?: AdminApplicationActorType;
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
