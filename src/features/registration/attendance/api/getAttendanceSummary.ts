import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { EntrySummary } from '@/shared/types/exhibition/check-in/entry';

/** 하루(date) 또는 박람회 전체 기간(null) 조회 조건. 서버는 date 와 all 을 함께 받지 않는다 */
export const toPeriodParams = (date: string | null) =>
  date === null ? { all: true } : { date };

// 입·퇴장 집계. 관리자 전용이고 박람회 ID 는 소문자 UUID 여야 한다
export const getAttendanceSummary = async (
  expoId: string,
  date: string | null,
): Promise<EntrySummary> => {
  try {
    const response = await clientTokenInstance.get<EntrySummary>(
      `/attendance/summary/${encodeURIComponent(expoId)}`,
      { params: toPeriodParams(date) },
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '입·퇴장 집계를 불러오지 못했습니다.');
  }
};
