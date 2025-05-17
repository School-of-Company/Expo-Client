import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { ExhibitionFormData } from '@/shared/types/exhibition/type';
import { handleEditExhibitionFormSubmit } from '../../lib/handleEditExhibitionFormSubmit';

export const useEditExhibitionMutation = (id: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExhibitionFormData) =>
      handleEditExhibitionFormSubmit(data, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['expoList'],
      });
      queryClient.invalidateQueries({
        queryKey: ['expoDetail', id],
      });
      queryClient.invalidateQueries({
        queryKey: ['standardProgram', id],
      });
      queryClient.invalidateQueries({
        queryKey: ['trainingProgram', id],
      });

      router.push(`/expo-detail/${id}`);
      toast.success('박람회가 수정되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
