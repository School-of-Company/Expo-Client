import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { createForm, CreateFormRequestDto } from '@/entities/form';
import { CreateFormRequest } from '@/shared/types/form/create/type';

export const useCreateApplicationForm = (
  id: string,
  type: 'STANDARD' | 'TRAINEE',
) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationKey: ['createApplicationForm', id, type],
    mutationFn: (formattedData: CreateFormRequest) =>
      createForm(id, formattedData as CreateFormRequestDto),
    onSuccess: () => {
      toast.success('박람회 등록 폼이 생성되었습니다.');
      router.push(`/exhibition/detail/${id}`);
      queryClient.resetQueries({
        queryKey: ['createApplicationForm', id, type],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
