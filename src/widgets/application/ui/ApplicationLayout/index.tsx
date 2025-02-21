'use client';

import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import OptionContainer from '@/entities/application/ui/OptionContainer';
import withLoading from '@/shared/hocs/withLoading';
import { handleFormErrors } from '@/shared/model/formErrorUtils';
import { ApplicationFormValues } from '@/shared/types/application/type';
import { Button, PageHeader } from '@/shared/ui';
import { useGetApplicaionForm } from '../../model/useGetApplicaionForm';
import { usePostApplication } from '../../model/usePostApplication';

const ApplicationLayout = ({
  params,
  type,
}: {
  params: string;
  type: string;
}) => {
  const { register, handleSubmit, watch } = useForm<ApplicationFormValues>();

  const { data: formList, isLoading } = useGetApplicaionForm(params, type);

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
            const selectedOptions = Array.isArray(value) ? value : [value];
            if (selectedOptions.includes('etc')) {
              const etcValue =
                data[`${form.title}_etc` as keyof ApplicationFormValues];
              selectedOptions[selectedOptions.indexOf('etc')] =
                `기타: ${etcValue}`;
            }
            acc[form.title] = selectedOptions.join(', ');
          } else if (form.formType === 'MULTIPLE' && value === 'etc') {
            const etcValue =
              data[`${form.title}_etc` as keyof ApplicationFormValues];
            acc[form.title] = `기타: ${etcValue}`;
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
            <OptionContainer
              title="이름을 입력하세요"
              formType="SENTENCE"
              requiredStatus={true}
              otherJson={null}
              register={register}
              watch={watch}
            />
            {formList?.dynamicForm?.map((form, index) => (
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
          <Button type="submit" text="신청하기" />
        </div>
      </form>
    ),
  });
};

export default ApplicationLayout;
