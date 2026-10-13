import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { retryProgramChanges } from '@/shared/api';
import { programQueryKeys } from '@/shared/queries';

export const useRetryProgramChangesMutation = (
  id: string,
  onRetried?: () => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => retryProgramChanges(id),
    onSuccess: async () => {
      // 변경이 반영된 목록과 revision을 다시 받아 온 뒤 폼을 새로 채운다
      await Promise.all([
        queryClient.refetchQueries({ queryKey: programQueryKeys.standard(id) }),
        queryClient.refetchQueries({ queryKey: programQueryKeys.training(id) }),
        queryClient.invalidateQueries({
          queryKey: programQueryKeys.schedule(id),
        }),
      ]);
      onRetried?.();
      toast.success(
        '중단된 프로그램 변경을 처리했습니다. 최신 내용을 다시 불러왔습니다.',
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
