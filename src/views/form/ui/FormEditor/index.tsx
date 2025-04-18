'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { CreateFormButton, PrivacyConsentForm } from '@/entities/form';
import { handleFormErrors } from '@/shared/model/formErrorUtils';
import { FormValues } from '@/shared/types/form/create/type';
import { Button, DetailHeader } from '@/shared/ui';
import FormContainer from '@/widgets/form/ui/FormContainer';
import { getFormTitle } from '../../model/getFormTitle';
import { selectOptionData } from '../../model/selectOptionData';

const FormEditor = ({
  type,
  mode,
  defaultValues,
  onSubmit,
  isLoading,
  isSuccess,
}: {
  type: 'STANDARD' | 'TRAINEE';
  mode: 'application' | 'survey';
  defaultValues?: FormValues;
  onSubmit: (data: FormValues) => void;
  isLoading: boolean;
  isSuccess: boolean;
}) => {
  const { control, handleSubmit, register, setValue, watch } =
    useForm<FormValues>({
      defaultValues: defaultValues || { questions: [] },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const handleFormSubmit = (data: FormValues) => {
    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit, (errors) =>
        handleFormErrors(errors, toast.error),
      )}
      className="flex w-full max-w-[816px] flex-1 flex-col overflow-y-auto"
    >
      <div className="space-y-80">
        <div className="space-y-40">
          <DetailHeader
            textCenter={true}
            headerTitle={getFormTitle(type, mode)}
          />
          <div className="space-y-12">
            <div className="w-full space-y-12">
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
            <PrivacyConsentForm
              placeholder="개인정보 동의 안내문을 입력해주세요"
              registration={register('informationText', {
                required: '개인정보 동의 안내문을 입력해주세요.',
              })}
              row={1}
              value={watch('informationText')}
            />
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
          </div>
        </div>
        <Button type="submit" disabled={isLoading || isSuccess}>
          {isLoading ? '제출 중...' : isSuccess ? '완료됨' : '생성하기'}
        </Button>
      </div>
    </form>
  );
};

export default FormEditor;
