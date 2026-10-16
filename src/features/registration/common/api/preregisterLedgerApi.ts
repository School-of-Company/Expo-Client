import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { AdminApplicationStatus, AdminOccupation } from './ledgerApi';

// ponytail: Expo-Application-Server#123 이 확정되기 전의 가정 계약이다.
// 경로·필드가 다르면 이 파일의 타입과 경로만 고친다. 화면은 이 파일의 타입만 쓴다.
// 행 단위는 예약/일행이다. 대기 일행은 User 저장 전이라 참가자 ID 가 없을 수 있다

export type PreregisterSort = 'CREATED_DESC' | 'CREATED_ASC';

export interface PreregisterMember {
  /** 대기 일행은 User 저장 전이라 null 이다 */
  participantId: number | null;
  name: string;
  phoneNumber: string | null;
  /** 메시지가 실제로 가는 대표자 번호 */
  notificationPhoneNumber: string | null;
  occupation: AdminOccupation | null;
}

export interface PreregisterHistory {
  id: number;
  status: AdminApplicationStatus;
  createdAt: string;
}

/** 사전등록 신청 한 건 = 대표자 1명 + 동행자 일행 */
export interface AdminPreregisterReservation {
  reservationId: string;
  sessionId: number;
  status: AdminApplicationStatus;
  createdAt: string;
  /** 대표자 + 동행자 인원 */
  applicants: number;
  /** 대기 순번. 대기 상태에만 있다 */
  waitingPosition: number | null;
  representative: PreregisterMember;
  companions: PreregisterMember[];
  /** 상세 조회에만 있다 */
  history?: PreregisterHistory[];
}

export interface AdminPreregisterPage {
  items: AdminPreregisterReservation[];
  /** 일행(신청) 수 */
  totalElements: number;
  /** 일행 수 기준 상태별 건수 */
  statusCounts: Partial<Record<AdminApplicationStatus, number>>;
  /** 인원 합. 서버가 주지 않으면 비워 둔다 */
  totalApplicants?: number;
  page: number;
  size: number;
}

export interface AdminPreregisterQuery {
  /** 대표자·동행자 이름·번호 */
  q?: string;
  sessionId?: number;
  /** 쉼표로 여러 상태 */
  status?: string;
  sort?: PreregisterSort;
  page?: number;
  size?: number;
}

/** 엑셀·그룹 메시지가 목록과 같은 대상을 다시 계산하도록 보내는 필터. 탭의 현재 조건만 담는다 */
export interface PreregisterTargetFilter {
  q?: string;
  sessionId?: number;
  status?: AdminApplicationStatus[];
  sort: PreregisterSort;
}

const basePath = (expoId: string) =>
  `/application/admin/expos/${encodeURIComponent(expoId)}/preregistrations`;

const compactParams = (params: object) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== '',
    ),
  );

export const getAdminPreregistrations = async (
  expoId: string,
  query: AdminPreregisterQuery,
): Promise<AdminPreregisterPage> => {
  try {
    const response = await clientTokenInstance.get(basePath(expoId), {
      params: compactParams(query),
    });
    return response.data;
  } catch (error) {
    throw toApiError(error, '사전등록 목록을 불러오지 못했습니다.');
  }
};

export const getAdminPreregistration = async (
  expoId: string,
  reservationId: string,
): Promise<AdminPreregisterReservation> => {
  try {
    const response = await clientTokenInstance.get(
      `${basePath(expoId)}/${encodeURIComponent(reservationId)}`,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '사전등록 상세를 불러오지 못했습니다.');
  }
};

export interface AdminPreregisterCancellationResult {
  reservationId: string;
  status: 'CANCELLED';
}

/** 일행 단위 취소. 취소 정책·권한·보호 규칙은 서버가 기존 신청 취소와 같게 검사한다 */
export const postAdminPreregistrationCancellation = async (
  expoId: string,
  reservationId: string,
): Promise<AdminPreregisterCancellationResult> => {
  try {
    const response = await clientTokenInstance.post(
      `${basePath(expoId)}/${encodeURIComponent(reservationId)}/cancellation`,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '사전등록 신청을 취소하지 못했습니다.');
  }
};
