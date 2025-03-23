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
    onError: () => {
      toast.error('박람회 삭제 실패');
    },
  });

  return {
    deleteExpo: deleteExpo.mutateAsync,
  };
};
