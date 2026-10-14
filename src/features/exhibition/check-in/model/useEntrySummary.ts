import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getEntrySummary } from '../api/getEntrySummary';

// 다른 입구에서 처리한 건수도 보이도록 주기적으로 다시 읽는다
const ENTRY_SUMMARY_REFRESH_MS = 30 * 1000;

export const entrySummaryQueryKey = (expoId: string) =>
  ['entrySummary', expoId] as const;

export const useEntrySummary = (expoId: string) =>
  useQuery({
    queryKey: entrySummaryQueryKey(expoId),
    queryFn: () => getEntrySummary(expoId),
    refetchInterval: ENTRY_SUMMARY_REFRESH_MS,
    // 집계는 보조 정보라 실패해도 토스트 없이 패널 안에만 표시한다
    meta: { silent: true },
  });

/** 이 화면에서 입장·퇴장을 처리한 뒤 집계를 바로 다시 읽게 한다 */
export const useInvalidateEntrySummary = (expoId: string) => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: entrySummaryQueryKey(expoId) });
};
