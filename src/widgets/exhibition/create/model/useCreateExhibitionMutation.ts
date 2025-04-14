import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { ExhibitionFormData } from '@/shared/types/exhibition/type';
import { handleCreateExhibitionFormSubmit } from './handleCreateExhibitionFormSubmit';

export const useCreateExhibitionMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExhibitionFormData) =>
      handleCreateExhibitionFormSubmit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expoList'] });
      router.push(`/`);
      toast.success('박람회가 생성되었습니다.');
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('알 수 없는 오류가 발생했습니다.');
      }
    },
  });
};
