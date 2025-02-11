'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { CreateFormButton } from '@/entities/form/create';
import { handleFormErrors } from '@/shared/model/formErrorUtils';
import { FormValues } from '@/shared/types/form/create/type';
import { Button, PageHeader } from '@/shared/ui';
import FormContainer from '@/widgets/form/create/ui/FormContainer';
import { Header } from '@/widgets/layout';
import { navigationTitles } from '../../model/navigationTitles';
import { selectOptionData } from '../../model/selectOptionData';
import { useSubmitForm } from '../../model/useSubmitForm';

const CreateForm = ({ id }: { id: string }) => {
  const { control, handleSubmit, register, setValue } = useForm<FormValues>({
    defaultValues: { questions: [] },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const {
    handleSubmitForm,
    isApplicationPending,
    isSurveyPending,
    isApplicationSuccess,
    isSurveySuccess,
  } = useSubmitForm(id);

  const searchParams = useSearchParams();
  const navigation = searchParams.get('navigation');

  useEffect(() => {
    setValue('questions', []);
  }, [navigation, setValue]);

  return (
    <div className="flex h-screen flex-col gap-[30px] mobile:gap-0">
      <Header />
      <form
        onSubmit={handleSubmit(
          (data) => handleSubmitForm(data),
          (errors) => handleFormErrors(errors, toast.error),
        )}
        className="mx-auto w-full max-w-[792px] flex-1 space-y-4 px-5 pb-5"
      >
        <PageHeader
          title={navigationTitles[navigation || 'standard_application']}
        />
        <div className="w-full space-y-8">
          {fields.map((field, index) => (
            <FormContainer
              key={field.id}
              {...{
                options: selectOptionData,
                formRemove: remove,
                index,
                register,
                setValue,
                control,
              }}
            />
          ))}
        </div>
        <CreateFormButton
          onClick={() =>
            append({
              title: '',
              formType: 'SENTENCE',
              options: [],
              requiredStatus: false,
              otherJson: null,
            })
          }
        />
        <Button
          type="submit"
          text={
            isApplicationPending || isSurveyPending
              ? '제출 중...'
              : isApplicationSuccess || isSurveySuccess
                ? '완료됨'
                : '다음'
          }
          disabled={
            isApplicationPending ||
            isSurveyPending ||
            isApplicationSuccess ||
            isSurveySuccess
          }
        />
      </form>
    </div>
  );
};

export default CreateForm;
