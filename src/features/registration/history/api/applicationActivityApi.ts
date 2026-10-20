import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import {
  AdminParticipantDetail,
  ProgramSessionDefinition,
  ProgramSessionType,
} from '../../common/api/ledgerApi';

// Expo-Application-Server 행사별 프로그램 신청 처리 이력
// (GET /application/admin/expos/{expoId}/program-session-applications/activities)
export type AdminApplicationAction = 'APPLIED' | 'CANCELLED' | 'PROMOTED';
/** UNKNOWN 은 처리주체가 기록되기 전의 과거 이력이다 */
export type AdminApplicationActorType = 'USER' | 'ADMIN' | 'SYSTEM' | 'UNKNOWN';

/** USER 취소를 실제로 실행한 대표자(서버 #143). participantId 와 reservationRequestId 중 하나만 있다 */
export interface AdminApplicationUserActor {
  /** User 대표 참가자 id. 대기 예약 실행자는 null */
  participantId: number | null;
  /** 같은 행사의 원본 대기 예약 requestId */
  reservationRequestId: string | null;
  role: 'REPRESENTATIVE';
  /** 조회 시점 User 이름(CURRENT_USER) 또는 대기 신청 당시 이름(REGISTRATION_SNAPSHOT). 조회 실패 시 null */
  name: string | null;
  nameSource: 'CURRENT_USER' | 'REGISTRATION_SNAPSHOT';
}

// 새 필드(처리주체·이전 상태·definition 등)는 서버 #131 배포 전에는 오지 않으므로 optional 로 둔다
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
  /** 처리주체. 과거 이력은 UNKNOWN 이며 사용자·자동으로 추정하지 않는다 */
  actorType?: AdminApplicationActorType;
  /** 사용자 취소의 실제 처리자(대표자). 신청 이력·과거 이력은 null 이며 participantId(대상)와 다르다 */
  actorUser?: AdminApplicationUserActor | null;
  /** 처리 전 상태. 최초 신청이면 null (previousStatusRecorded=true) */
  previousStatus?: string | null;
  /** false 는 과거 미기록, true 이면서 previousStatus=null 은 최초 신청 */
  previousStatusRecorded?: boolean;
  receiptNumber?: number;
  /** 제출 당시 프로그램 정의. 삭제된 회차도 남고 누락 필드는 서버가 채우지 않는다 */
  definition?: Partial<ProgramSessionDefinition>;
  /** 현재 User 참가자 정보. 처리 당시 정보가 아니다 */
  participant?: AdminParticipantDetail | null;
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
  /** 현재 User 참가자 검색어 (1–50자, 공백만은 400) */
  q?: string;
  programType?: ProgramSessionType;
  /** programType 과 함께 보낸다 */
  programId?: number;
  /** 이력에 기록된 처리 결과 상태. 현재 신청 상태가 아니다 */
  status?: string;
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
