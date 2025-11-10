import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { CreateFormRequest } from '@/shared/types/form/create/type';
import { createSurveyForm } from '../api/createSurveyForm';

export const useCreateSurveyForm = (
  id: string,
  type: 'STANDARD' | 'TRAINEE',
  startDate: string,
  endDate: string,
) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ['createSurveyForm', id, type],
    mutationFn: (formattedData: CreateFormRequest) =>
      createSurveyForm({ data: formattedData, id, startDate, endDate }),
    onSuccess: () => {
      toast.success('만족도 조사 폼이 생성되었습니다.');
      router.push(`/exhibition/detail/${id}`);
      queryClient.resetQueries({
        queryKey: ['createSurveyForm', id, type],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
