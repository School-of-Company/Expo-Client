'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { CreateFormButton } from '@/entities/form';
import { handleFormErrors } from '@/shared/model/formErrorUtils';
import { FormValues } from '@/shared/types/form/create/type';
import { Button, PageHeader } from '@/shared/ui';
import FormContainer from '@/widgets/form/ui/FormContainer';
import { getFormTitle } from '../../model/getFormTitle';
import { selectOptionData } from '../../model/selectOptionData';
import { useSubmitForm } from '../../model/useSubmitForm';

const FormEditor = ({
  id,
  type,
  mode,
  defaultValues,
}: {
  id: string;
  type: 'STANDARD' | 'TRAINEE';
  mode: 'application' | 'survey';
  defaultValues?: FormValues;
}) => {
  const { control, handleSubmit, register, setValue, reset } =
    useForm<FormValues>({
      defaultValues: defaultValues || { questions: [] },
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
  } = useSubmitForm(id, type, mode, reset);

  return (
    <div className="flex h-screen flex-col gap-[30px] mobile:gap-0">
      <form
        onSubmit={handleSubmit(
          (data) => handleSubmitForm(data),
          (errors) => handleFormErrors(errors, toast.error),
        )}
        className="mx-auto w-full max-w-[792px] flex-1 space-y-4 px-5 pb-5"
      >
        <PageHeader title={getFormTitle(type, mode)} />
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

export default FormEditor;
