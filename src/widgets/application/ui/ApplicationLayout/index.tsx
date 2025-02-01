'use client';

import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import OptionContainer from '@/entities/application/ui/OptionContainer';
import withLoading from '@/shared/hocs/withLoading';
import { handleFormErrors } from '@/shared/model/formErrorUtils';
import { ApplicationFormValues } from '@/shared/types/application/type';
import { Button, PageHeader } from '@/shared/ui';
import { useGetForm } from '../../model/useGetForm';
import { usePostApplication } from '../../model/usePostApplication';

const ApplicationLayout = ({
  params,
  type,
}: {
  params: string;
  type: string;
}) => {
  const { register, handleSubmit } = useForm<ApplicationFormValues>();

  const { data: formList, isLoading } = useGetForm(params, type);

  const { mutate: PostApplication } = usePostApplication(params, type);

  const showError = (message: string) => {
    toast.error(message);
  };

  const onSubmit = (data: ApplicationFormValues) => {
    const formattedData: {
      trainingId?: string;
      name: string;
      phoneNumber: string;
      personalInformationStatus: boolean;
      informationJson: string;
    } = {
      name: String(data['이름을 입력하세요'] || ''),
      phoneNumber: String(data['휴대폰 번호를 입력하세요'] || ''),
      personalInformationStatus: true,
      informationJson: JSON.stringify(
        formList?.dynamicForm?.reduce<Record<string, string>>((acc, form) => {
          const value = data[form.title as keyof ApplicationFormValues];
          if (form.formType === 'CHECKBOX') {
            acc[form.title] = Array.isArray(value)
              ? value.join(', ')
              : String(value || '');
          } else {
            acc[form.title] = String(value || '');
          }
          return acc;
        }, {}),
      ),
    };

    if (type === 'TRAINEE') {
      formattedData.trainingId = String(
        data['연수원 아이디를 입력하세요'] || '',
      );
    }

    PostApplication(formattedData);
  };

  return withLoading({
    isLoading,
    children: (
      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log(errors);
          handleFormErrors(errors, showError);
        })}
      >
        <PageHeader title="신청" />
        <div className="ml-[20px] mt-[48px] flex flex-col gap-[48px]">
          <div className="w-full space-y-[36px]">
            {type === 'TRAINEE' ? (
              <OptionContainer
                title="연수원 아이디를 입력하세요"
                formType="SENTENCE"
                register={register}
              />
            ) : null}
            <OptionContainer
              title="휴대폰 번호를 입력하세요"
              formType="SENTENCE"
              register={register}
            />
            <OptionContainer
              title="이름을 입력하세요"
              formType="SENTENCE"
              register={register}
            />
            {formList?.dynamicForm?.map((form, index) => (
              <OptionContainer
                key={index}
                title={form.title}
                formType={form.formType}
                jsonData={form.jsonData}
                register={register}
              />
            ))}
          </div>
          <Button type="submit" text="신청하기" />
        </div>
      </form>
    ),
  });
};

export default ApplicationLayout;
