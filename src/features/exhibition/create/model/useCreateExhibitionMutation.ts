import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { ExhibitionFormData } from '@/shared/types/exhibition/type';
import { handleCreateExhibitionFormSubmit } from '../lib/handleCreateExhibitionFormSubmit';

export const useCreateExhibitionMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExhibitionFormData) =>
      handleCreateExhibitionFormSubmit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expoList'] });
      // 목록 카드의 폼·설문 생성 여부도 박람회 목록과 함께 바뀐다
      queryClient.invalidateQueries({ queryKey: ['expoValid'] });
      router.push('/admin');
      toast.success('박람회가 생성되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
