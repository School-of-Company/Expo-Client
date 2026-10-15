import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { AdminOccupation } from './ledgerApi';

// Expo-Application-Server AdminPreregisterSummaryController 응답 형식

/** 대기가 있는데 승급하지 않는 저장 기준 사유. 서버가 새 값을 더할 수 있어 string 도 받는다 */
export type PreregisterPromotionBlockedReason =
  | 'CLOSED'
  | 'SESSION_STARTED'
  | 'HEAD_TOO_LARGE'
  | (string & {});

/** 사전등록 회차별 확정·취소 고유 참가자, User 확정 전 예약과 대기 상태 */
export interface AdminPreregisterSessionSummary {
  sessionId: number;
  confirmedParticipants: number;
  cancelledParticipants: number;
  /** 대기 일행 인원 합 */
  waitingParticipants: number;
  pendingReservations: number;
  pendingApplicants: number;
  /** 대기 일행 수 */
  waitingReservations: number;
  /** 대기 선두 일행 인원. 빈 확정석보다 크면 엄격 FIFO 로 승급이 멈춘다 */
  waitingHeadApplicants: number | null;
  /** 저장된 정원 기준 빈 확정석 */
  freeConfirmedSeats: number | null;
  /** Application 이 적용한 대기 정원. null 이면 미적용이라 채택해야 한다 */
  appliedWaitingCapacity: number | null;
  promotionBlockedReason: PreregisterPromotionBlockedReason | null;
}

/** 직업별 사전등록 인원. 확정은 User 참가자 직업, 대기는 신청 스냅샷 직업 기준이다 */
export interface AdminPreregisterOccupationSummary {
  /** null 이면 직업 답변이 없거나 User 직업이 비어 있다 */
  occupation: AdminOccupation | null;
  confirmedParticipants: number;
  waitingParticipants: number;
}

/**
 * 행사 사전등록 인원. 대표자·동행자를 각각 한 명으로 세며 프로그램 신청·출석 인원은 포함하지 않는다.
 * 확정 인원만 현재 고유 인원이고, 취소 인원은 확정 인원과 겹칠 수 있다(취소 후 다시 등록)
 */
export interface AdminPreregisterSummary {
  expoId: string;
  confirmedUniqueParticipants: number;
  cancelledUniqueParticipants: number;
  /** User 저장 전 대기 일행 인원 합 */
  waitingParticipants: number;
  /** User 확정 전 예약 건수 */
  pendingReservations: number;
  /** User 확정 전 예약의 신청 인원 합 */
  pendingApplicants: number;
  sessions: AdminPreregisterSessionSummary[];
  /** 9개 직업과 미분류(null)가 항상 온다. 합계는 확정·대기 인원과 같다 */
  occupations: AdminPreregisterOccupationSummary[];
}

export const getAdminPreregisterSummary = async (
  expoId: string,
): Promise<AdminPreregisterSummary> => {
  try {
    const response = await clientTokenInstance.get(
      `/application/admin/expos/${encodeURIComponent(expoId)}/preregistrations/summary`,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '사전등록 인원을 불러오지 못했습니다.');
  }
};
