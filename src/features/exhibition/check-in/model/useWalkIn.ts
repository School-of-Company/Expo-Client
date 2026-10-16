import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import { WalkInCategory } from '@/shared/types/exhibition/check-in/entry';
import { getWalkInCounts, postWalkIn } from '../api/walkInCounts';
import { useInvalidateEntrySummary } from './useEntrySummary';

const WALK_IN_REFRESH_MS = 30 * 1000;

export const walkInQueryKey = (expoId: string) => ['walkIn', expoId] as const;

export const useWalkInCounts = (expoId: string) =>
  useQuery({
    queryKey: walkInQueryKey(expoId),
    queryFn: () => getWalkInCounts(expoId),
    // 다른 입구에서 누른 수도 보이도록 주기적으로 다시 읽는다
    refetchInterval: WALK_IN_REFRESH_MS,
    // 404 는 Gateway 라우트가 아직 없거나 박람회가 없는 경우라 다시 보내도 같다
    retry: (failureCount, error) =>
      getErrorStatus(error) !== 404 && failureCount < 1,
    meta: { silent: true },
  });

export const useRecordWalkIn = (expoId: string, scannerName?: string) => {
  const queryClient = useQueryClient();
  const invalidateSummary = useInvalidateEntrySummary(expoId);

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
