import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { deleteExpoApi } from '../api/deleteExpoApi';

export const useDeleteActions = () => {
  const queryClient = useQueryClient();

  const deleteExpo = useMutation({
    mutationFn: deleteExpoApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expoList'] });
      toast.success('박람회 삭제 성공');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // 실패는 onError 가 알린다. mutateAsync 를 넘기면 호출부에서 잡지 않은 rejection 이 된다
  return {
    deleteExpo: deleteExpo.mutate,
  };
};
