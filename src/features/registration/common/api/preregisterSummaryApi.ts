import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';

// Expo-Application-Server AdminPreregisterSummaryController 응답 형식

/** 사전등록 회차별 확정·취소 고유 참가자와 User 확정 전 예약 */
export interface AdminPreregisterSessionSummary {
  sessionId: number;
  confirmedParticipants: number;
  cancelledParticipants: number;
  /** 현행 정책상 항상 0 */
  waitingParticipants: number;
  pendingReservations: number;
  pendingApplicants: number;
}

/**
 * 행사 사전등록 인원. 대표자·동행자를 각각 한 명으로 세며 프로그램 신청·출석 인원은 포함하지 않는다.
 * 확정 인원만 현재 고유 인원이고, 취소 인원은 확정 인원과 겹칠 수 있다(취소 후 다시 등록)
 */
export interface AdminPreregisterSummary {
  expoId: string;
  confirmedUniqueParticipants: number;
  cancelledUniqueParticipants: number;
  /** 현행 정책상 항상 0 */
  waitingParticipants: number;
  /** User 확정 전 예약 건수 */
  pendingReservations: number;
  /** User 확정 전 예약의 신청 인원 합 */
  pendingApplicants: number;
  sessions: AdminPreregisterSessionSummary[];
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
