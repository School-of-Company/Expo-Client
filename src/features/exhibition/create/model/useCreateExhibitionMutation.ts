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
      router.push(`/`);
      toast.success('박람회가 생성되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
