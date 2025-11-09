import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { printBadge } from '@/shared/model';
import {
  FormattedApplicationData,
  FormattedSurveyData,
} from '@/shared/types/application/type';
import { ApplicationType } from '@/shared/types/exhibition/type';
import { postApplication } from '../api/postApplication';

export const usePostApplication = (
  params: string,
  formType: 'application' | 'survey',
  userType: 'STANDARD' | 'TRAINEE',
  applicationType: ApplicationType,
) => {
  const router = useRouter();
  const getMessages = () => {
    if (formType === 'survey') {
      return {
        success: '만족도 조사 제출이 완료되었습니다.',
      };
    }
    return {
      success: '박람회 등록이 완료되었습니다.',
    };
  };

  const { success } = getMessages();

  return useMutation({
    mutationFn: (data: FormattedApplicationData | FormattedSurveyData) =>
      postApplication(params, formType, userType, applicationType, data),
    onSuccess: (response, variables) => {
      toast.success(success);

      if (
        formType === 'application' &&
        userType === 'STANDARD' &&
        applicationType === 'FIELD' &&
        response &&
        response.participantId &&
        response.phoneNumber &&
        response.expoId
      ) {
        const qrPayload = {
          participantId: response.participantId,
          phoneNumber: response.phoneNumber,
          expoId: response.expoId,
        };

        const badgeData = {
          name:
            ('name' in variables ? variables.name : undefined) || '이름 없음',
          qrCode: JSON.stringify(qrPayload),
          isTemporary: true,
        };

        printBadge(badgeData);
        return;
      }

      if (formType === 'application') {
        router.push(
          `/application/success/${params}?userType=${userType}&formType=${formType}`,
        );
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
