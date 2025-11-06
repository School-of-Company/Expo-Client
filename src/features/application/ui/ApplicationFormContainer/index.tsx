'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { PrivacyConsent } from '@/entities/application';
import OptionContainer from '@/entities/application/ui/OptionContainer';
import { withLoading } from '@/shared/hocs';
import { handleFormErrors, printBadge } from '@/shared/model';
import { showError } from '@/shared/model';
import {
  ApplicationForm,
  ApplicationFormValues,
  DynamicFormItem,
  DynamicFormValues,
  FormattedApplicationData,
} from '@/shared/types/application/type';
import { ApplicationType } from '@/shared/types/exhibition/type';
import { Button, DetailHeader } from '@/shared/ui';
import { postApplication } from '../../api/postApplication';
import { postTrainingProgramSelection } from '../../api/postTrainingProgramSelection';
import { extractTrainingProgramData } from '../../lib/extractTrainingProgramData';
import { filterConditionalQuestions } from '../../lib/filterConditionalQuestions';
import { getFormatter } from '../../lib/formatterService';
import { useGetForm } from '../../model/useGetForm';

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const ApplicationFormContainer = ({ params }: { params: string }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const formType = searchParams.get('formType') as 'application' | 'survey';
  const userType = searchParams.get('userType') as 'STANDARD' | 'TRAINEE';
  const applicationType = (searchParams.get('applicationType') ||
    'PRE') as ApplicationType;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    unregister,
    control,
  } = useForm<ApplicationFormValues>();

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

  const formValues = watch();
  const prevVisibleQuestionsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const allQuestions =
      formList?.dynamicForm || formList?.dynamicSurveyResponseDto || [];
    const visibleQuestions = filterConditionalQuestions(
      allQuestions,
      formValues as Record<string, string | string[]>,
    );

    const currentVisibleSet = new Set(
      visibleQuestions.map((q) => slugify(q.title)),
    );

    prevVisibleQuestionsRef.current.forEach((prevFieldName) => {
      if (!currentVisibleSet.has(prevFieldName)) {
        const question = allQuestions.find(
          (q) => slugify(q.title) === prevFieldName,
        );
        const shouldPreserve =
          question &&
          (question.title.includes('연수 프로그램') ||
            question.title.includes('연수원 아이디'));

        if (!shouldPreserve) unregister(prevFieldName);
      }
    });

    prevVisibleQuestionsRef.current = currentVisibleSet;
  }, [formValues, formList, unregister]);

  const getDynamicFormData = (
    values?: Record<string, string | string[] | boolean>,
  ): DynamicFormItem[] => {
    const allQuestions =
      formList?.dynamicForm || formList?.dynamicSurveyResponseDto || [];

    return filterConditionalQuestions(
      allQuestions,
      (values || formValues) as Record<string, string | string[]>,
    );
  };

  const onSubmit = async (data: ApplicationFormValues): Promise<void> => {
    if (!data.privacyConsent) {
      toast.error('개인정보 제공 동의 여부를 체크해주세요');
      return;
    }

    setIsSubmitting(true);

    try {
      const { privacyConsent, ...rest } = data;
      const dynamicFormValues = rest as DynamicFormValues;

      const formatter = getFormatter(
        formType,
        userType,
        getDynamicFormData(data),
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
        const allQuestions =
          formList?.dynamicForm || formList?.dynamicSurveyResponseDto || [];

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

      const successMessage =
        formType === 'survey'
          ? '만족도 조사 제출이 완료되었습니다.'
          : '박람회 등록이 완료되었습니다.';

      toast.success(successMessage);
      reset();

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
      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          handleFormErrors(errors, showError);
        })}
        method="POST"
        className="flex w-full max-w-[816px] flex-1 flex-col gap-30 overflow-y-auto"
      >
        <div className="mt-30">
          <DetailHeader headerTitle={formList?.title ?? ''} />
        </div>

        <div className="flex flex-col gap-[48px]">
          <div className="w-full space-y-[36px]">
            {getDynamicFormData().map((form, index) => (
              <OptionContainer
                key={`${form.title}-${index}`}
                title={form.title}
                formType={form.formType}
                jsonData={form.jsonData}
                requiredStatus={form.requiredStatus}
                otherJson={form.otherJson}
                register={register}
                watch={watch}
                setValue={setValue}
                control={control}
              />
            ))}
          </div>
          <PrivacyConsent
            content={formList?.informationText ?? ''}
            watch={watch}
            setValue={setValue}
          />
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? '등록 중...' : '등록하기'}
          </Button>
        </div>
      </form>
    ),
  });
};

export default ApplicationFormContainer;
