'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'react-toastify';
import { PrivacyConsent } from '@/entities/application';
import { adaptDynamicFormToSchema } from '@/features/form/common/lib/formAdapter';
import { FormValues as RendererFormValues } from '@/features/form/renderer/lib/visibilityEngine';
import { FormRenderer } from '@/features/form/renderer/ui';
import { withLoading } from '@/shared/hocs';
import { printBadge } from '@/shared/model';
import {
  ApplicationForm,
  ApplicationFormValues,
  DynamicFormValues,
  FormattedApplicationData,
} from '@/shared/types/application/type';
import { ApplicationType } from '@/shared/types/exhibition/type';
import { DetailHeader, Button } from '@/shared/ui';
import { postApplication } from '../../api/postApplication';
import { postTrainingProgramSelection } from '../../api/postTrainingProgramSelection';
import { extractTrainingProgramData } from '../../lib/extractTrainingProgramData';
import { getFormatter } from '../../lib/formatterService';
import { useGetForm } from '../../model/useGetForm';

const ApplicationFormContainer = ({ params }: { params: string }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const formType = searchParams.get('formType') as 'application' | 'survey';
  const userType = searchParams.get('userType') as 'STANDARD' | 'TRAINEE';
  const applicationType = (searchParams.get('applicationType') ||
    'PRE') as ApplicationType;

  const {
    data: formList,
    isLoading,
    error,
  } = useGetForm(params, userType, formType, applicationType) as {
    data: ApplicationForm | undefined;
    isLoading: boolean;
    error: Error | null;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = useMemo(() => {
    if (!formList) return null;
    const questions =
      formList.dynamicForm || formList.dynamicSurveyResponseDto || [];
    return adaptDynamicFormToSchema(questions, formList.title);
  }, [formList]);

  const onSubmit = async (data: ApplicationFormValues): Promise<void> => {
    if (!data.privacyConsent) {
      toast.error('개인정보 제공 동의 여부를 체크해주세요');
      return;
    }

    setIsSubmitting(true);

    try {
      const { privacyConsent, ...rest } = data;
      const dynamicFormValues = rest as DynamicFormValues;
      const allQuestions =
        formList?.dynamicForm || formList?.dynamicSurveyResponseDto || [];

      const formatter = getFormatter(
        formType,
        userType,
        allQuestions,
        searchParams.get('phoneNumber'),
        applicationType,
      );

      const formattedData = formatter({
        ...dynamicFormValues,
        privacyConsent,
      } as DynamicFormValues & { privacyConsent: boolean });

      let response;

      if (
        formType === 'application' &&
        userType === 'TRAINEE' &&
        applicationType === 'PRE'
      ) {
        const trainingProgramData = await extractTrainingProgramData(
          dynamicFormValues,
          allQuestions,
          params,
          formattedData as FormattedApplicationData,
        );

        if (trainingProgramData)
          await postTrainingProgramSelection(params, trainingProgramData);
      } else {
        response = await postApplication(
          params,
          formType,
          userType,
          applicationType,
          formattedData,
        );
      }
      if (formType === 'survey') {
        router.push(
          `/application/success/${params}?formType=survey&userType=${userType}`,
        );
      }

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
            ('name' in formattedData ? formattedData.name : undefined) ||
            '이름 없음',
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
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '폼 등록에 실패했습니다',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="flex w-full max-w-[816px] flex-1 items-center justify-center text-body1r text-gray-500 mobile:text-body2r">
        {error.message ?? '박람회 폼 조회를 실패했습니다'}
      </div>
    );
  }

  return withLoading({
    isLoading,
    children: (
      <div className="flex w-full max-w-[816px] flex-1 flex-col gap-30 overflow-y-auto">
        <div className="mt-30">
          <DetailHeader headerTitle={formList?.title ?? ''} />
        </div>

        {formSchema && (
          <FormRenderer
            schema={formSchema}
            onSubmit={onSubmit}
            renderFooter={(
              methods: UseFormReturn<
                RendererFormValues & ApplicationFormValues
              >,
            ) => (
              <div className="mt-48 flex flex-col gap-30">
                <PrivacyConsent
                  content={formList?.informationText ?? ''}
                  watch={methods.watch}
                  setValue={methods.setValue}
                />
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? '등록 중...' : '등록하기'}
                </Button>
              </div>
            )}
          />
        )}
      </div>
    ),
  });
};

export default ApplicationFormContainer;
