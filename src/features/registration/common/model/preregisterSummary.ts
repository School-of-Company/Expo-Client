import { useQuery } from '@tanstack/react-query';
import { getAdminPreregisterSummary } from '../api/preregisterSummaryApi';
import { LEDGER_REFRESH_MS } from './ledger';

export const preregisterSummaryQueryKey = (expoId: string) =>
  ['adminPreregisterSummary', expoId] as const;

/** 행사 사전등록 고유 인원. 프로그램 신청 현황과 같은 주기로 다시 조회한다 */
export const usePreregisterSummary = (expoId: string) =>
  useQuery({
    queryKey: preregisterSummaryQueryKey(expoId),
    queryFn: () => getAdminPreregisterSummary(expoId),
    refetchInterval: LEDGER_REFRESH_MS,
  });
