import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { printBadge } from '@/shared/model/printUtils';
import {
  FormattedApplicationData,
  FormattedSurveyData,
} from '@/shared/types/application/type';
import { postApplication } from '../api/postApplication';

export const usePostApplication = (
  params: string,
  formType: 'application' | 'survey',
  userType: 'STANDARD' | 'TRAINEE',
  applicationType: 'register' | 'onsite',
) => {
  const router = useRouter();
  const getMessages = () => {
    if (formType === 'survey') {
      return {
        success: '만족도 조사 제출이 완료되었습니다.',
        error: '만족도 조사 제출에 실패했습니다.',
      };
    }
    return {
      success: '박람회 신청이 완료되었습니다.',
      error: '박람회 신청에 실패했습니다.',
    };
  };

  const { success, error } = getMessages();

  return useMutation({
    mutationFn: (data: FormattedApplicationData | FormattedSurveyData) =>
      postApplication(params, formType, userType, applicationType, data),
    onSuccess: (response, variables) => {
      toast.success(success);

      if (
        formType === 'application' &&
        userType === 'STANDARD' &&
        applicationType === 'onsite' &&
        response &&
        response.participantId &&
        response.phoneNumber
      ) {
        const qrPayload = {
          participantId: response.participantId,
          phoneNumber: response.phoneNumber,
        };

        const name = 'name' in variables ? variables.name : '이름 없음';

        const badgeData = {
          name,
          qrCode: JSON.stringify(qrPayload),
          isTemporary: true,
        };

        printBadge(badgeData);
      }
      router.push(
        `/application-success/${params}?userType=${userType}?formType=${formType}`,
      );
    },
    onError: () => {
      toast.error(error);
    },
  });
};
