import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { toast } from 'react-toastify';
import { CreateFormRequest } from '@/shared/types/form/create/type';
import { createApplicationForm } from '../api/createApplicationForm';
import { formCreateRouter } from './formCreateRouter';

export const useCreateApplicationForm = (
  id: string,
  type: 'STANDARD' | 'TRAINEE',
  router: AppRouterInstance,
  mode: 'application' | 'survey',
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['createApplicationForm', id, type],
    mutationFn: (formattedData: CreateFormRequest) =>
      createApplicationForm({ data: formattedData, id }),
    onSuccess: () => {
      toast.success('신청 폼이 생성되었습니다.');
      formCreateRouter({ id, type, mode, router });
      queryClient.resetQueries({
        queryKey: ['createApplicationForm', id, type],
      });
    },
    onError: () => {
      toast.error('신청 폼 생성에 실패했습니다.');
    },
  });
};
