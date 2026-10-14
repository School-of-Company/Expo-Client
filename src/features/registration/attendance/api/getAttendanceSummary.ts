import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { EntrySummary } from '@/shared/types/exhibition/check-in/entry';

// 하루치 입·퇴장 집계. 관리자 전용이고 박람회 ID 는 소문자 UUID 여야 한다
export const getAttendanceSummary = async (
  expoId: string,
  date: string,
): Promise<EntrySummary> => {
  try {
    const response = await clientTokenInstance.get<EntrySummary>(
      `/attendance/summary/${encodeURIComponent(expoId)}`,
      { params: { date } },
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '입·퇴장 집계를 불러오지 못했습니다.');
  }
};
