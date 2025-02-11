import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { toast } from 'react-toastify';
import { CreateFormRequest } from '@/shared/types/form/create/type';
import { createApplicationForm } from '../api/createApplicationForm';
import { formCreateRouter } from './formCreateRouter';

export const useCreateApplicationForm = (
  id: string,
  navigation: string | null,
  router: AppRouterInstance,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['createApplicationForm', id, navigation],
    mutationFn: (formattedData: CreateFormRequest) =>
      createApplicationForm({ data: formattedData, id }),
    onSuccess: () => {
      toast.success('신청 폼이 생성되었습니다.');
      formCreateRouter({ id, navigation, router });
      queryClient.resetQueries({ queryKey: ['createForm', id, navigation] });
    },
    onError: () => {
      toast.error('신청 폼 생성에 실패했습니다.');
    },
  });
};
