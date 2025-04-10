'use client';

import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { PrivacyConsent } from '@/entities/application';
import OptionContainer from '@/entities/application/ui/OptionContainer';
import withLoading from '@/shared/hocs/withLoading';
import { handleFormErrors } from '@/shared/model/formErrorUtils';
import {
  ApplicationFormValues,
  DynamicFormItem,
  DynamicFormValues,
} from '@/shared/types/application/type';
import { Button, DetailHeader } from '@/shared/ui';
import { getFormatter } from '../../model/formatterService';
import { useGetForm } from '../../model/useGetForm';
import { usePostApplication } from '../../model/usePostApplication';

interface ApplicationForm {
  informationText: string;
  dynamicForm?: DynamicFormItem[];
  dynamicSurveyResponseDto?: DynamicFormItem[];
}

const ApplicationLayout = ({ params }: { params: string }) => {
  const searchParams = useSearchParams();
  const formType = searchParams.get('formType') as 'application' | 'survey';
  const userType = searchParams.get('userType') as 'STANDARD' | 'TRAINEE';
  const applicationType = searchParams.get('applicationType') as
    | 'register'
    | 'onsite';
  const { register, handleSubmit, watch, setValue } =
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

    const { privacyConsent: _privacyConsent, ...dynamicFormValues } = data;
    const formatter = getFormatter(formType, userType, getDynamicFormData());
    const formattedData = formatter(dynamicFormValues as DynamicFormValues);

    PostApplication(formattedData);
  };

  return withLoading({
    isLoading,
    children: (
      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          handleFormErrors(errors, showError);
        })}
      >
        <DetailHeader textCenter={true} headerTitle="신청" />
        <div className="ml-[20px] mt-[48px] flex flex-col gap-[48px]">
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
            <OptionContainer
              title="휴대폰 번호를 입력하세요"
              formType="SENTENCE"
              requiredStatus={true}
              otherJson={null}
              register={register}
              watch={watch}
              setValue={setValue}
            />
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
            {userType === 'STANDARD' && formType === 'application' ? (
              <>
                <OptionContainer
                  title="소속을 입력하세요"
                  formType="SENTENCE"
                  requiredStatus={true}
                  otherJson={null}
                  register={register}
                  watch={watch}
                  setValue={setValue}
                />
                <OptionContainer
                  title="학교급을 선택해주세요"
                  formType="MULTIPLE"
                  requiredStatus={true}
                  otherJson="etc"
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  jsonData={{
                    '1': '유치원',
                    '2': '초등학교',
                    '3': '중학교',
                    '4': '고등학교',
                  }}
                />
                <OptionContainer
                  title="학교이름을 입력해주세요"
                  formType="SENTENCE"
                  requiredStatus={true}
                  otherJson={null}
                  register={register}
                  watch={watch}
                  setValue={setValue}
                />
              </>
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
