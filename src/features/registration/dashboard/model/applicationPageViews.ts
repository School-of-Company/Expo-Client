import { useQuery } from '@tanstack/react-query';
import { LEDGER_REFRESH_MS } from '../../common/model/ledger';
import { getApplicationPageViews } from '../api/pageViewsApi';

export const applicationPageViewsQueryKey = (expoId: string) =>
  ['adminApplicationPageViews', expoId] as const;

/** 참가자 신청화면 조회 집계. 대시보드 다른 숫자와 같은 주기로 갱신한다 */
export const useApplicationPageViews = (expoId: string) =>
  useQuery({
    queryKey: applicationPageViewsQueryKey(expoId),
    queryFn: () => getApplicationPageViews(expoId),
    select: ({ today, totalPageViews, daily }) => ({
      today,
      totalPageViews,
      // 일별 고유 방문자 합. 여러 날 들어온 사람은 날마다 센다
      totalDailyVisitors: daily.reduce(
        (sum, { uniqueVisitors }) => sum + uniqueVisitors,
        0,
      ),
    }),
    refetchInterval: LEDGER_REFRESH_MS,
    meta: { silent: true },
  });
