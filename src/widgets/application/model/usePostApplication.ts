import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FormattedApplicationData } from '@/shared/types/application/type';
import { postApplication } from '../api/postApplication';

export const usePostApplication = (
  params: string,
  formType: 'application' | 'survey',
  userType: 'STANDARD' | 'TRAINEE',
  applicationType: 'register' | 'onsite',
) => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: FormattedApplicationData) =>
      postApplication(params, formType, userType, applicationType, data),
    onSuccess: () => {
      toast.success('박람회 신청이 완료되었습니다.');
      router.push('/');
    },
    onError: () => {
      toast.error('박람회 신청에 실패했습니다.');
    },
  });
};
