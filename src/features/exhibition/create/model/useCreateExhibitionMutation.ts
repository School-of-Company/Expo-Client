import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { getRegistrationRoutes } from '@/shared/config';
import { ExhibitionFormData } from '@/shared/types/exhibition/type';
import { handleCreateExhibitionFormSubmit } from '../lib/handleCreateExhibitionFormSubmit';

export const useCreateExhibitionMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExhibitionFormData) =>
      handleCreateExhibitionFormSubmit(data),
    onSuccess: ({ expoId, policyError }) => {
      queryClient.invalidateQueries({ queryKey: ['expoList'] });
      // 목록 카드의 폼·설문 생성 여부도 박람회 목록과 함께 바뀐다
      queryClient.invalidateQueries({ queryKey: ['expoValid'] });
      if (policyError) {
        // 박람회는 만들어졌으니 생성 화면에 두지 않고 남은 신청 설정을 할 곳으로 보낸다
        router.push(getRegistrationRoutes(expoId).schedule);
        toast.error(
          `박람회는 만들었지만 등록 폼·신청 설정을 마치지 못했습니다. ${policyError.message} 관리 화면에서 이어서 설정해주세요.`,
          { autoClose: false },
        );
        return;
      }
      router.push('/admin');
      toast.success('박람회가 생성되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
