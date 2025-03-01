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

interface FormattedData {
  name: string;
  phoneNumber: string;
  personalInformationStatus: boolean;
  trainingId?: string;
  affiliation?: string;
  schoolLevel?: string;
  schoolDatail?: string;
  informationJson?: string;
}

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

  const onSubmit = (data: ApplicationFormValues): void => {
    const baseFormattedData: FormattedData = {
      name: String(data['이름을 입력하세요'] || ''),
      phoneNumber: String(data['휴대폰 번호를 입력하세요'] || ''),
      personalInformationStatus: true,
    };

    const processSchoolLevel = (
      schoolLevel: unknown,
      _etcValue: unknown,
    ): string => {
      const schoolLevelMap: { [key: string]: string } = {
        유치원: 'KINDERGARTEN',
        초등학교: 'ELEMENTARY',
        중학교: 'MIDDLE',
        고등학교: 'HIGH',
      };

      if (Array.isArray(schoolLevel)) {
        return schoolLevel
          .map((level) => {
            if (level === 'etc') {
              return 'OTHER';
            }
            return schoolLevelMap[level] || level;
          })
          .join(', ');
      } else {
        if (schoolLevel === 'etc') {
          return 'OTHER';
        }
        return schoolLevelMap[schoolLevel as string] || String(schoolLevel);
      }
    };

    const formattedData: FormattedData =
      type === 'TRAINEE'
        ? {
            ...baseFormattedData,
            trainingId: String(data['연수원 아이디를 입력하세요'] || ''),
          }
        : type === 'STANDARD'
          ? {
              ...baseFormattedData,
              affiliation: String(data['소속을 입력하세요'] || ''),
              schoolLevel: processSchoolLevel(
                data['학교급을 선택해주세요'],
                data['학교급을 선택해주세요_etc'],
              ),
              schoolDatail: String(data['학교이름을 입력해주세요'] || ''),
            }
          : baseFormattedData;

    const processFormField = (
      title: string,
      value: unknown,
      formType: string,
    ): string => {
      if (formType === 'CHECKBOX' || formType === 'MULTIPLE') {
        const selectedOptions = Array.isArray(value) ? value : [value];
        return selectedOptions
          .map((option) =>
            option === 'etc'
              ? `기타: ${
                  Array.isArray(
                    data[`${title}_etc` as keyof ApplicationFormValues],
                  )
                    ? (
                        data[
                          `${title}_etc` as keyof ApplicationFormValues
                        ] as string[]
                      ).join(', ')
                    : data[`${title}_etc` as keyof ApplicationFormValues] || ''
                }`
              : String(option),
          )
          .join(', ');
      } else {
        return String(value || '');
      }
    };

    const dynamicFormData = formList?.dynamicForm?.reduce<
      Record<string, string>
    >((acc, form) => {
      const value = data[form.title as keyof ApplicationFormValues];
      acc[form.title] = processFormField(form.title, value, form.formType);
      return acc;
    }, {});

    const finalFormattedData = {
      ...formattedData,
      informationJson: JSON.stringify(dynamicFormData),
    };

    PostApplication(finalFormattedData);
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
            {type === 'STANDARD' && (
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
            )}

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
