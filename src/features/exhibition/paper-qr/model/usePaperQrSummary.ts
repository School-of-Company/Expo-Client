import { useQuery } from '@tanstack/react-query';
import { getQrTokenSummary } from '../api/qrTokensApi';

export const paperQrSummaryQueryKey = (expoId: string) =>
  ['paperQrSummary', expoId] as const;

/** 구분별 종이 QR 발급 현황. 발급·무효화 뒤에는 이 키를 무효화한다 */
export const usePaperQrSummary = (expoId: string) =>
  useQuery({
    queryKey: paperQrSummaryQueryKey(expoId),
    queryFn: () => getQrTokenSummary(expoId),
    meta: { silent: true },
  });
