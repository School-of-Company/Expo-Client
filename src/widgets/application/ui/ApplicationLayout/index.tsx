'use client';

import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import OptionContainer from '@/entities/application/ui/OptionContainer';
import withLoading from '@/shared/hocs/withLoading';
import { handleFormErrors } from '@/shared/model/formErrorUtils';
import {
  ApplicationFormValues,
  DynamicFormItem,
} from '@/shared/types/application/type';
import { Button, DetailHeader } from '@/shared/ui';
import { getFormatter } from '../../model/formatterService';
import { useGetForm } from '../../model/useGetForm';
import { usePostApplication } from '../../model/usePostApplication';

type DynamicFormValues = {
  [key: string]: string | string[] | undefined;
};

type ExtendedApplicationFormValues = ApplicationFormValues & DynamicFormValues;

interface ApplicationForm {
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
  const { register, handleSubmit, watch } =
    useForm<ExtendedApplicationFormValues>();

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

  const onSubmit = (data: ExtendedApplicationFormValues): void => {
    const formatter = getFormatter(formType, userType, getDynamicFormData());
    const formattedData = formatter(data);
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
              />
            ) : null}
            <OptionContainer
              title="휴대폰 번호를 입력하세요"
              formType="SENTENCE"
              requiredStatus={true}
              otherJson={null}
              register={register}
              watch={watch}
            />
            {formType === 'application' ? (
              <OptionContainer
                title="이름을 입력하세요"
                formType="SENTENCE"
                requiredStatus={true}
                otherJson={null}
                register={register}
                watch={watch}
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
                />
                <OptionContainer
                  title="학교급을 선택해주세요"
                  formType="MULTIPLE"
                  requiredStatus={true}
                  otherJson="etc"
                  register={register}
                  watch={watch}
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
              />
            ))}
          </div>
          <Button disabled={isPending} type="submit">
            신청하기
          </Button>
        </div>
      </form>
    ),
  });
};

export default ApplicationLayout;
