import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { toast } from 'react-toastify';
import { CreateFormRequest } from '@/shared/types/form/create/type';
import { editApplicationForm } from '../api/editApplicationForm';
import { editSurveyForm } from '../api/editSurveyForm';

export const useEditApplicationForm = (
  id: string,
  type: 'STANDARD' | 'TRAINEE',
  router: AppRouterInstance,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['editApplicationForm', id, type],
    mutationFn: (formattedData: CreateFormRequest) =>
      editApplicationForm({ data: formattedData, id }),
    onSuccess: () => {
      toast.success('신청 폼이 수정되었습니다.');
      queryClient.invalidateQueries({
        queryKey: ['getApplicationForm', id, type],
      });
      queryClient.invalidateQueries({
        queryKey: ['getEditApplicationForm', id, type],
      });
      router.push(`/expo-detail/${id}`);
    },
    onError: () => {
      toast.error('신청 폼 수정에 실패했습니다.');
    },
  });
};

export const useEditSurveyForm = (
  id: string,
  type: 'STANDARD' | 'TRAINEE',
  router: AppRouterInstance,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['editSurveyForm', id, type],
    mutationFn: (formattedData: CreateFormRequest) =>
      editSurveyForm({ data: formattedData, id }),
    onSuccess: () => {
      toast.success('만족도 조사 폼이 수정되었습니다.');
      queryClient.invalidateQueries({
        queryKey: ['getSurveyForm', id, type],
      });
      queryClient.invalidateQueries({
        queryKey: ['getEditSurveyForm', id, type],
      });
      router.push(`/expo-detail/${id}`);
    },
    onError: () => {
      toast.error('만족도 조사 폼 수정에 실패했습니다.');
    },
  });
};
