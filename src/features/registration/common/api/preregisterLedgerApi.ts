import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { AdminOccupation, AdminParticipantDetail } from './ledgerApi';

// Expo-Application-Server AdminPreregistrationController (docs/admin-preregistration-ledger.md)

/** PENDING 은 User 확정 전 복구 중인 예약(좌석 보유)이다 */
export type AdminPreregisterStatus =
  | 'CONFIRMED'
  | 'WAITING'
  | 'CANCELLED'
  | 'PENDING';

/** 예약 일행의 제출 당시 스냅샷. 동행자는 질문·답변으로만 확인한다 */
export interface PreregisterReservationSnapshot {
  name?: string | null;
  phoneNumber?: string | null;
  occupation?: AdminOccupation | null;
  informationJson?: Record<string, unknown> | null;
  questions?: unknown;
}

/**
 * 목록의 한 행. 단위가 상태마다 다르다.
 * - CONFIRMED / CANCELLED: 참가자 1명 (applicationId, applicants=1)
 * - WAITING / PENDING / 철회된 대기 CANCELLED: User 저장 전 예약 일행 (reservationId, applicants=일행 인원)
 */
export interface AdminPreregisterRow {
  /** 상세·선택에 그대로 쓰는 행 식별자 */
  key: string;
  expoId: string;
  sessionId: number;
  status: AdminPreregisterStatus;
  applicationId: number | null;
  reservationId: string | null;
  /** 예약 행은 null 이다. 참가자 ID 를 추정하지 않는다 */
  participantId: number | null;
  representativeId: number | null;
  applicants: number;
  /** 예약 행은 생성 시각이 없어 null 이다 */
  createdAt: string | null;
  /** 참가자 행의 User 현재 정보 */
  participant: AdminParticipantDetail | null;
  /** 예약 행의 제출 당시 정보 */
  reservation: PreregisterReservationSnapshot | null;
}

export interface AdminPreregisterPage {
  items: AdminPreregisterRow[];
  /** 서로 다른 단위의 행 수다. 인원 수가 아니다 */
  totalElements: number;
  page: number;
  size: number;
}

/** 서버는 알 수 없거나 빈 파라미터를 400 으로 거절하므로 값이 있는 것만 보낸다 */
export interface AdminPreregisterQuery {
  sessionId?: number;
  /** 쉼표로 여러 상태 */
  status?: string;
  /** 1–50자 */
  q?: string;
  page?: number;
  size?: number;
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

/** 목록 행의 key 로 한 행을 다시 읽는다. 사라진 key 는 404 이며 다른 행으로 바꿔 주지 않는다 */
export const getAdminPreregistration = async (
  expoId: string,
  key: string,
): Promise<AdminPreregisterRow> => {
  try {
    const response = await clientTokenInstance.get(
      `${basePath(expoId)}/detail`,
      {
        params: { key },
      },
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '사전등록 상세를 불러오지 못했습니다.');
  }
};
