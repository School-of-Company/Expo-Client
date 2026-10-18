import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { toast } from 'react-toastify';
import { formKeys, updateForm, UpdateFormRequestDto } from '@/entities/form';
import {
  CreateSurveyRequestDto,
  surveyKeys,
  updateSurvey,
} from '@/entities/survey';
import { getFormReturnPath } from '@/shared/config';
import { CreateFormRequest } from '@/shared/types/form/create/type';

export const useEditApplicationForm = (
  id: string,
  type: 'STANDARD' | 'TRAINEE',
  router: AppRouterInstance,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['editApplicationForm', id, type],
    mutationFn: (formattedData: CreateFormRequest) =>
      updateForm(id, formattedData as UpdateFormRequestDto),
    onSuccess: () => {
      toast.success('박람회 등록 폼이 수정되었습니다.');
      queryClient.invalidateQueries({
        queryKey: [...formKeys.expo(id), type],
      });
      router.push(getFormReturnPath(id));
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
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['editSurveyForm', id, type],
    mutationFn: (formattedData: CreateFormRequest) =>
      updateSurvey(id, formattedData as CreateSurveyRequestDto),
    onSuccess: () => {
      toast.success('만족도 조사 폼이 수정되었습니다.');
      queryClient.invalidateQueries({
        queryKey: surveyKeys.detail(id, type),
      });
      router.push(getFormReturnPath(id));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
