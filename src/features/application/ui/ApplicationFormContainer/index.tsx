'use client';

import { useSearchParams } from 'next/navigation';
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
import { getFormatter } from '../../lib/formatterService';
import { getHeaderTitle } from '../../lib/getHeaderTitle';
import { getWarningMessage } from '../../lib/getWarningMessage';
import { useGetForm } from '../../model/useGetForm';
import { usePostApplication } from '../../model/usePostApplication';

const ApplicationFormContainer = ({ params }: { params: string }) => {
  const searchParams = useSearchParams();
  const formType = searchParams.get('formType') as 'application' | 'survey';
  const userType = searchParams.get('userType') as 'STANDARD' | 'TRAINEE';
  const applicationType = searchParams.get(
    'applicationType',
  ) as ApplicationType;
  const phoneNumber = searchParams.get('phoneNumber');

  const { register, handleSubmit, watch, setValue, reset } =
    useForm<ApplicationFormValues>();

  const {
    data: formList,
    isLoading,
    error,
  } = useGetForm(params, userType, formType) as {
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

  const getDynamicFormData = (): DynamicFormItem[] => {
    return formList?.dynamicForm || formList?.dynamicSurveyResponseDto || [];
  };

  const onSubmit = (data: ApplicationFormValues): void => {
    if (!data.privacyConsent) {
      toast.error('개인정보 제공 동의 여부를 체크해주세요');
      return;
    }

    const { privacyConsent, ...dynamicFormValues } = data;

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
          <DetailHeader
            textCenter={true}
            headerTitle={getHeaderTitle(formType, userType, applicationType)}
          />
        </div>

        <div className="flex flex-col gap-[48px]">
          <div className="w-full space-y-[36px]">
            {userType === 'TRAINEE' && formType === 'application' ? (
              <OptionContainer
                title="연수원 아이디를 입력하세요"
                formType="SENTENCE"
                requiredStatus={true}
                otherJson={null}
                register={register}
                watch={watch}
                setValue={setValue}
              />
            ) : null}
            {formType === 'application' &&
            applicationType === 'ONSITE' &&
            userType === 'STANDARD' ? (
              <OptionContainer
                title="휴대폰 번호를 입력하세요"
                formType="APPLICATIONPHONEOPTION"
                requiredStatus={true}
                otherJson={null}
                type="number"
                register={register}
                watch={watch}
                setValue={setValue}
                warningMessage={getWarningMessage(formType, applicationType)}
              />
            ) : (
              <OptionContainer
                title="휴대폰 번호를 입력하세요"
                formType="SENTENCE"
                requiredStatus={true}
                otherJson={null}
                type="number"
                register={register}
                watch={watch}
                setValue={setValue}
                readOnly={formType === 'survey' && !!phoneNumber}
                defaultValue={phoneNumber ?? ''}
                warningMessage={getWarningMessage(formType, applicationType)}
              />
            )}

            {formType === 'application' ? (
              <OptionContainer
                title="이름을 입력하세요"
                formType="SENTENCE"
                requiredStatus={true}
                otherJson={null}
                register={register}
                watch={watch}
                setValue={setValue}
              />
            ) : null}

            {getDynamicFormData().map((form, index) => (
              <OptionContainer
                key={index}
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
