'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { PrivacyConsent } from '@/entities/application';
import OptionContainer from '@/entities/application/ui/OptionContainer';
import { withLoading } from '@/shared/hocs';
import { handleFormErrors } from '@/shared/model';
import { showError } from '@/shared/model';
import {
  ApplicationForm,
  ApplicationFormValues,
  DynamicFormItem,
  DynamicFormValues,
} from '@/shared/types/application/type';
import { ApplicationType } from '@/shared/types/exhibition/type';
import { Button, DetailHeader } from '@/shared/ui';
import { postTrainingProgramSelection } from '../../api/postTrainingProgramSelection';
import { extractTrainingProgramData } from '../../lib/extractTrainingProgramData';
import { filterConditionalQuestions } from '../../lib/filterConditionalQuestions';
import { getFormatter } from '../../lib/formatterService';
import { useGetForm } from '../../model/useGetForm';
import { usePostApplication } from '../../model/usePostApplication';

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const ApplicationFormContainer = ({ params }: { params: string }) => {
  const searchParams = useSearchParams();
  const formType = searchParams.get('formType') as 'application' | 'survey';
  const userType = searchParams.get('userType') as 'STANDARD' | 'TRAINEE';
  const applicationType = (searchParams.get('applicationType') ||
    'PRE') as ApplicationType;

  const { register, handleSubmit, watch, setValue, reset, unregister } =
    useForm<ApplicationFormValues>();

  const {
    data: formList,
    isLoading,
    error,
  } = useGetForm(params, userType, formType, applicationType) as {
    data: ApplicationForm | undefined;
    isLoading: boolean;
    error: Error | null;
  };

  const { mutate: PostApplication, isPending } = usePostApplication(
    params,
    formType,
    userType,
    applicationType,
  );

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
      if (!currentVisibleSet.has(prevFieldName)) unregister(prevFieldName);
    });

    prevVisibleQuestionsRef.current = currentVisibleSet;
  }, [formValues, formList, unregister]);

  const getDynamicFormData = (): DynamicFormItem[] => {
    const allQuestions =
      formList?.dynamicForm || formList?.dynamicSurveyResponseDto || [];

    return filterConditionalQuestions(
      allQuestions,
      formValues as Record<string, string | string[]>,
    );
  };

  const onSubmit = async (data: ApplicationFormValues): Promise<void> => {
    if (!data.privacyConsent) {
      toast.error('개인정보 제공 동의 여부를 체크해주세요');
      return;
    }

    const { privacyConsent, ...rest } = data;
    const dynamicFormValues = rest as DynamicFormValues;

    if (
      formType === 'application' &&
      userType === 'TRAINEE' &&
      applicationType === 'PRE'
    ) {
      const trainingProgramData = extractTrainingProgramData(
        dynamicFormValues,
        getDynamicFormData(),
      );

      if (trainingProgramData) {
        try {
          await postTrainingProgramSelection(trainingProgramData);
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : '연수 프로그램 선택 등록 실패',
          );
          return;
        }
      }
    }

    const formatter = getFormatter(formType, userType, getDynamicFormData());

    const formattedData = formatter({
      ...dynamicFormValues,
      privacyConsent,
    } as DynamicFormValues & { privacyConsent: boolean });

    PostApplication(formattedData, {
      onSuccess: () => {
        reset();
      },
    });
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
              />
            ))}
          </div>
          <PrivacyConsent
            content={formList?.informationText ?? ''}
            watch={watch}
            setValue={setValue}
          />
          <Button disabled={isPending} type="submit">
            등록하기
          </Button>
        </div>
      </form>
    ),
  });
};

export default ApplicationFormContainer;
