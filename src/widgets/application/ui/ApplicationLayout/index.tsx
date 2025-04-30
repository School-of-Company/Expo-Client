'use client';

import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { PrivacyConsent } from '@/entities/application';
import OptionContainer from '@/entities/application/ui/OptionContainer';
import withLoading from '@/shared/hocs/withLoading';
import { handleFormErrors } from '@/shared/model/formErrorUtils';
import {
  ApplicationForm,
  ApplicationFormValues,
  DynamicFormItem,
  DynamicFormValues,
} from '@/shared/types/application/type';
import { Button, DetailHeader } from '@/shared/ui';
import { getFormatter } from '../../model/formatterService';
import { getHeaderTitle } from '../../model/getHeaderTitle';
import { useGetForm } from '../../model/useGetForm';
import { usePostApplication } from '../../model/usePostApplication';

const ApplicationLayout = ({ params }: { params: string }) => {
  const searchParams = useSearchParams();
  const formType = searchParams.get('formType') as 'application' | 'survey';
  const userType = searchParams.get('userType') as 'STANDARD' | 'TRAINEE';
  const applicationType = searchParams.get('applicationType') as
    | 'register'
    | 'onsite';
  const phoneNumber = searchParams.get('phoneNumber');

  const { register, handleSubmit, watch, setValue, reset } =
    useForm<ApplicationFormValues>();

  const { data: formList, isLoading } = useGetForm(
    params,
    userType,
    formType,
  ) as {
    data: ApplicationForm | undefined;
    isLoading: boolean;
  };

  const { mutate: PostApplication, isPending } = usePostApplication(
    params,
    formType,
    userType,
    applicationType,
  );

  const showError = (message: string) => {
    toast.error(message);
  };

  const getDynamicFormData = (): DynamicFormItem[] => {
    return formList?.dynamicForm || formList?.dynamicSurveyResponseDto || [];
  };

  const onSubmit = (data: ApplicationFormValues): void => {
    if (!data.privacyConsent) {
      toast.error('개인정보 제공 동의 여부를 체크해주세요');
      return;
    }

    const { privacyConsent, ...dynamicFormValues } = data;

    const formatter = getFormatter(
      formType,
      userType,
      getDynamicFormData(),
      applicationType,
    );

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

  return withLoading({
    isLoading,
    children: (
      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          handleFormErrors(errors, showError);
        })}
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
            applicationType === 'onsite' &&
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
            신청하기
          </Button>
        </div>
      </form>
    ),
  });
};

export default ApplicationLayout;
