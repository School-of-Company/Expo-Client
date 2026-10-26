import type { LiveSeats } from '../model/liveSeats';

/** 쿠키 없이 CDN 캐시를 타는 공개 현황. 로그인용 `/api/server` 프록시를 거치지 않는다 */
export const getLiveSeats = async (expoId: string): Promise<LiveSeats> => {
  const response = await fetch(
    `/api/public/expos/${encodeURIComponent(expoId)}/seats`,
  );
  if (!response.ok) throw new Error('정원 현황을 불러오지 못했습니다.');
  return response.json();
};
