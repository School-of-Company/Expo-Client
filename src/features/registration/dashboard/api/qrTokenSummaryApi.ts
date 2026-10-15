import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';

// Expo-Attendance-Server GET /qr-tokens/{expoId}/summary. 관리자 전용

export interface QrTokenCategorySummary {
  category: string;
  /** 사용 중인 수 */
  active: number;
  /** 무효화한 수 */
  revoked: number;
}

export const getQrTokenSummary = async (
  expoId: string,
): Promise<QrTokenCategorySummary[]> => {
  try {
    const response = await clientTokenInstance.get<{
      categories: QrTokenCategorySummary[];
    }>(`/qr-tokens/${encodeURIComponent(expoId)}/summary`);
    return response.data.categories ?? [];
  } catch (error) {
    throw toApiError(error, '종이 QR 발급 현황을 불러오지 못했습니다.');
  }
};
