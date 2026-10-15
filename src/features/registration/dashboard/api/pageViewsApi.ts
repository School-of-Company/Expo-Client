import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';

// Expo-Application-Server AdminApplicationPageViews. 날짜는 Asia/Seoul 기준

export interface ApplicationPageViewDay {
  date: string;
  /** 새로고침·재진입을 포함한 조회 수 */
  pageViews: number;
  /** 그날 고유 방문자 수 */
  uniqueVisitors: number;
}

export interface AdminApplicationPageViews {
  expoId: string;
  today: ApplicationPageViewDay;
  totalPageViews: number;
  /** 기록이 있는 날짜만, 날짜 오름차순 */
  daily: ApplicationPageViewDay[];
}

export const getApplicationPageViews = async (
  expoId: string,
): Promise<AdminApplicationPageViews> => {
  try {
    const response = await clientTokenInstance.get<AdminApplicationPageViews>(
      `/application/admin/expos/${encodeURIComponent(expoId)}/page-views`,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '신청화면 조회 수를 불러오지 못했습니다.');
  }
};
