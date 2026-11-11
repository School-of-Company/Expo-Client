import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { getExpoRoutes } from '@/shared/config';
import { ExhibitionFormData } from '@/shared/types/exhibition/type';
import { handleCreateExhibitionFormSubmit } from '../lib/handleCreateExhibitionFormSubmit';

export const useCreateExhibitionMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExhibitionFormData) =>
      handleCreateExhibitionFormSubmit(data),
    onSuccess: (expoId: string | number | undefined) => {
      queryClient.invalidateQueries({ queryKey: ['expoList'] });
      // 목록 카드의 폼·설문 생성 여부도 박람회 목록과 함께 바뀐다
      queryClient.invalidateQueries({ queryKey: ['expoValid'] });
      // 응답에 박람회 ID 가 없으면 2단계 주소를 만들 수 없어 예전처럼 목록으로 간다
      if (expoId === undefined || expoId === null || expoId === '') {
        toast.success('박람회가 생성되었습니다.');
        router.push('/admin');
        return;
      }
      toast.success('박람회가 생성되었습니다. 이어서 폼을 설정해 주세요.');
      // 2단계(폼 설정)로 바로 넘어간다. 기록을 바꿔 뒤로 가기로 1단계에 돌아가 같은 박람회를 또 만들지 않게 한다
      router.replace(getExpoRoutes(String(expoId)).createForms);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
