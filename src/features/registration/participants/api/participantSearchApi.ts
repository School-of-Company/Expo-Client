import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { AdminParticipantDetail } from '../../common/api/ledgerApi';

export type AdminParticipantItem = AdminParticipantDetail;

export interface AdminParticipantPage {
  items: AdminParticipantItem[];
  /** 마지막 페이지면 null */
  nextCursor: number | null;
}

export interface AdminParticipantQr {
  participantId: number;
  /** 입장 QR 값. 로그·저장소에 남기지 않는다 */
  code: string;
}

const basePath = (expoId: string) =>
  `/application/admin/expos/${encodeURIComponent(expoId)}/participants`;

/** 현장 QR 분실 시 이름·전화번호로 참가자 검색 (APPLICATION_READ). 서버는 빈 q 와 q 없는 요청을 400 으로 거절하므로 호출 쪽에서 q 가 있을 때만 부른다 */
export const getAdminParticipants = async (
  expoId: string,
  query: { q?: string; cursor?: number; size: number },
): Promise<AdminParticipantPage> => {
  try {
    const response = await clientTokenInstance.get(basePath(expoId), {
      params: { ...query, q: query.q || undefined },
    });
    return response.data;
  } catch (error) {
    throw toApiError(error, '참가자를 불러오지 못했습니다.');
  }
};

/** 사전등록이 확정되고 취소되지 않은 참가자의 Attendance QR 값 */
export const getAdminParticipantQr = async (
  expoId: string,
  participantId: number,
): Promise<AdminParticipantQr> => {
  try {
    const response = await clientTokenInstance.get(
      `${basePath(expoId)}/${participantId}/qr`,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '입장 QR 을 불러오지 못했습니다.');
  }
};
