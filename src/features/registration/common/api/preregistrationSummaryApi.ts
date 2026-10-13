import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';

/** 사전등록 회차별 인원. 대표자와 동행자를 각각 한 명으로 센다 */
export interface PreregistrationSessionSummary {
  sessionId: number;
  confirmedParticipants: number;
  cancelledParticipants: number;
  /** 현행 정책상 항상 0 */
  waitingParticipants: number;
  /** User 확정 전 예약 건수 */
  pendingReservations: number;
  /** User 확정 전 예약의 신청 인원 */
  pendingApplicants: number;
}

/**
 * 사전등록 고유 인원 집계. 프로그램 신청·출석 인원은 포함하지 않는다.
 * 취소 인원은 확정 인원과 중복될 수 있어 합산하지 않는다
 */
export interface PreregistrationSummary {
  expoId: string;
  confirmedUniqueParticipants: number;
  cancelledUniqueParticipants: number;
  waitingParticipants: number;
  pendingReservations: number;
  pendingApplicants: number;
  sessions: PreregistrationSessionSummary[];
}

export const getPreregistrationSummary = async (
  expoId: string,
): Promise<PreregistrationSummary> => {
  try {
    const response = await clientTokenInstance.get(
      `/application/admin/expos/${encodeURIComponent(expoId)}/preregistrations/summary`,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '사전등록 현황을 불러오지 못했습니다.');
  }
};
