import { useQuery } from '@tanstack/react-query';
import { LEDGER_REFRESH_MS } from '../../common/model/ledger';
import { getQrTokenSummary } from '../api/qrTokenSummaryApi';

// 종이 QR 화면과 같은 키라 한쪽에서 받은 값을 함께 쓴다
export const activeQrQueryKey = (expoId: string) =>
  ['paperQrSummary', expoId] as const;

/** 인쇄 QR 중 사용 중지하지 않은 수와 중지한 수 */
export const useActiveQrSummary = (expoId: string) =>
  useQuery({
    queryKey: activeQrQueryKey(expoId),
    queryFn: () => getQrTokenSummary(expoId),
    select: (categories) =>
      categories.reduce(
        (sum, { active, revoked }) => ({
          active: sum.active + active,
          revoked: sum.revoked + revoked,
        }),
        { active: 0, revoked: 0 },
      ),
    refetchInterval: LEDGER_REFRESH_MS,
    meta: { silent: true },
  });
