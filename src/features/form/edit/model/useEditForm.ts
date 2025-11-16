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
  startDate: string,
  endDate: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['editApplicationForm', id, type],
    mutationFn: (formattedData: CreateFormRequest) =>
      editApplicationForm({
        data: { ...formattedData, startDate, endDate },
        id,
      }),
    onSuccess: () => {
      toast.success('박람회 등록 폼이 수정되었습니다.');
      queryClient.invalidateQueries({
        queryKey: ['getApplicationForm', id, type],
      });
      queryClient.invalidateQueries({
        queryKey: ['getEditApplicationForm', id, type],
      });
      router.push(`/exhibition/detail/${id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useEditSurveyForm = (
  id: string,
  type: 'STANDARD' | 'TRAINEE',
  router: AppRouterInstance,
  startDate: string,
  endDate: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['editSurveyForm', id, type],
    mutationFn: (formattedData: CreateFormRequest) =>
      editSurveyForm({
        data: { ...formattedData, startDate, endDate },
        id,
      }),
    onSuccess: () => {
      toast.success('만족도 조사 폼이 수정되었습니다.');
      queryClient.invalidateQueries({
        queryKey: ['getSurveyForm', id, type],
      });
      queryClient.invalidateQueries({
        queryKey: ['getEditSurveyForm', id, type],
      });
      router.push(`/exhibition/detail/${id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
