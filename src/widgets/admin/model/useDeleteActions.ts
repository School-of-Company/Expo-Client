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

  return {
    deleteExpo: deleteExpo.mutateAsync,
  };
};
