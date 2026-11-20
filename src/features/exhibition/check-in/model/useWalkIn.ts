import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import { useScanHttp } from '@/shared/libs/http/ScanHttpContext';
import { WalkInCategory } from '@/shared/types/exhibition/check-in/entry';
import { getWalkInCounts, postWalkIn } from '../api/walkInCounts';
import { useInvalidateEntrySummary } from './useEntrySummary';

const WALK_IN_REFRESH_MS = 30 * 1000;

export const walkInQueryKey = (expoId: string) => ['walkIn', expoId] as const;

export const useWalkInCounts = (expoId: string) => {
  const http = useScanHttp();
  return useQuery({
    // 요청 인스턴스는 관리자·스태프 화면에 따라 다를 뿐 받는 값은 같다. 두 화면이 한 페이지에 함께 뜨지 않는다
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: walkInQueryKey(expoId),
    queryFn: () => getWalkInCounts(expoId, http),
    // 다른 입구에서 누른 수도 보이도록 주기적으로 다시 읽는다
    refetchInterval: WALK_IN_REFRESH_MS,
    // 404 는 Gateway 라우트가 아직 없거나 박람회가 없는 경우라 다시 보내도 같다
    retry: (failureCount, error) =>
      getErrorStatus(error) !== 404 && failureCount < 1,
    meta: { silent: true },
  });
};

export const useRecordWalkIn = (expoId: string, scannerName?: string) => {
  const queryClient = useQueryClient();
  const invalidateSummary = useInvalidateEntrySummary(expoId);
  const http = useScanHttp();

  return useMutation({
    mutationFn: ({
      category,
      action,
    }: {
      category: WalkInCategory;
      action: 'ADD' | 'UNDO';
    }) =>
      postWalkIn(
        expoId,
        {
          category,
          action,
          requestId: crypto.randomUUID(),
        },
        scannerName,
        http,
      ),
    onSuccess: (counts) => {
      queryClient.setQueryData(walkInQueryKey(expoId), counts);
      invalidateSummary();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
