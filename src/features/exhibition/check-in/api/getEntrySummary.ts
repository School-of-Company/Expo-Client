import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { EntrySummary } from '@/shared/types/exhibition/check-in/entry';

// 오늘(Asia/Seoul) 입장 처리 건수. 관리자 전용이고 박람회 ID 는 소문자 UUID 여야 한다.
// Swagger 에는 쿼리가 reqDto 객체로 나오지만 실제 바인딩은 ?date=yyyy-MM-dd 이고 생략하면 오늘이다
export const getEntrySummary = async (
  expoId: string,
): Promise<EntrySummary> => {
  try {
    const response = await clientTokenInstance.get<EntrySummary>(
      `/attendance/summary/${encodeURIComponent(expoId)}`,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '오늘 입장 처리 건수를 불러오지 못했습니다.');
  }
};
