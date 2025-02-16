import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { toast } from 'react-toastify';
import { CreateFormRequest } from '@/shared/types/form/create/type';
import { formCreateRouter } from '../../model/formCreateRouter';
import { createSurveyForm } from '../api/createSurveyForm';

export const useCreateSurveyForm = (
  id: string,
  type: 'STANDARD' | 'TRAINEE',
  router: AppRouterInstance,
  mode: 'application' | 'survey',
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['createSurveyForm', id, type],
    mutationFn: (formattedData: CreateFormRequest) =>
      createSurveyForm({ data: formattedData, id }),
    onSuccess: () => {
      toast.success('만족도 조사 폼이 생성되었습니다.');
      formCreateRouter({ id, type, mode, router });
      queryClient.resetQueries({
        queryKey: ['createSurveyForm', id, type],
      });
    },
    onError: () => {
      toast.error('만족도 조사 폼 생성에 실패했습니다.');
    },
  });
};
