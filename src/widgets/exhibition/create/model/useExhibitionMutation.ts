import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { ExhibitionFormData } from '@/shared/types/exhibition/create/type';
import { handleExhibitionFormSubmit } from './exhibitionFormHandler';

export const useExhibitionMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExhibitionFormData) =>
      handleExhibitionFormSubmit(data, router, queryClient),
    onSuccess: (expoId) => {
      if (expoId) {
        router.push(`/expo-created/${expoId}`);
        toast.success('박람회가 생성되었습니다.');
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error('박람회 생성에 실패했습니다.');
    },
  });
};
