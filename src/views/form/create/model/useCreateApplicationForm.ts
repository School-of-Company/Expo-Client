import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { CreateFormRequest } from '@/shared/types/form/create/type';
import { createApplicationForm } from '../api/createApplicationForm';

export const useCreateApplicationForm = (
  id: string,
  type: 'STANDARD' | 'TRAINEE',
) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ['createApplicationForm', id, type],
    mutationFn: (formattedData: CreateFormRequest) =>
      createApplicationForm({ data: formattedData, id }),
    onSuccess: () => {
      toast.success('신청 폼이 생성되었습니다.');
      router.push(`/expo-detail/${id}`);
      queryClient.resetQueries({
        queryKey: ['createApplicationForm', id, type],
      });
    },
    onError: () => {
      toast.error('신청 폼 생성에 실패했습니다.');
    },
  });
};
