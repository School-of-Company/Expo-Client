import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { ExhibitionFormData } from '@/shared/types/exhibition/create/type';
import { handleEditExhibitionFormSubmit } from './handleEditExhibitionFormSubmit';

export const useEditExhibitionMutation = (id: number) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExhibitionFormData) =>
      handleEditExhibitionFormSubmit(data, router, queryClient, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['expoList'],
      });
      queryClient.invalidateQueries({
        queryKey: ['expoDetail', id],
      });
      queryClient.invalidateQueries({
        queryKey: ['expoStandard', id],
      });
      queryClient.invalidateQueries({
        queryKey: ['expoTraining', id],
      });

      router.push(`/expo-detail/${id}`);
      toast.success('박람회가 수정되었습니다.');
    },
    onError: (error) => {
      console.error(error);
      toast.error('박람회 수정에 실패했습니다.');
    },
  });
};
