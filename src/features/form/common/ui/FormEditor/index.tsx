'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  CreateFormButton,
  PrivacyConsentForm,
  selectOptionData,
} from '@/entities/form';
import { handleFormErrors } from '@/shared/model';
import { FormValues } from '@/shared/types/form/create/type';
import { Button, DetailHeaderEditable } from '@/shared/ui';
import FormContainer from '../FormContainer';

const FormEditor = ({
  expoId,
  defaultValues,
  onSubmit,
  isLoading,
  isSuccess,
}: {
  expoId: string;
  type: 'STANDARD' | 'TRAINEE';
  mode: 'application' | 'survey';
  defaultValues?: FormValues;
  onSubmit: (data: FormValues) => void;
  isLoading: boolean;
  isSuccess: boolean;
}) => {
  const { control, handleSubmit, register, setValue, watch } =
    useForm<FormValues>({
      defaultValues: defaultValues || { questions: [], informationText: '' },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const [hasPrivacyConsent, setHasPrivacyConsent] = useState(
    !!defaultValues?.informationText,
  );

  const handleFormSubmit = (data: FormValues) => {
    const submitData = {
      ...data,
      informationText: hasPrivacyConsent ? data.informationText : '',
    };
    onSubmit(submitData);
  };

  const handleAddPrivacyConsent = () => {
    setHasPrivacyConsent(true);
    setValue('informationText', '');
  };

  const handleRemovePrivacyConsent = () => {
    setHasPrivacyConsent(false);
    setValue('informationText', '');
  };

  const filteredSelectOptions = selectOptionData.filter(
    (option) => option.value !== 'PRIVACYCONSENT',
  );

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit, (errors) =>
        handleFormErrors(errors, toast.error),
      )}
      method="POST"
      className="flex w-full max-w-[816px] flex-1 flex-col overflow-y-auto"
    >
      <div className="space-y-80">
        <div className="space-y-40">
          <DetailHeaderEditable
            registration={register('title', {
              required: '제목을 입력해주세요.',
            })}
            textCenter={true}
          />
          <div className="space-y-12">
            <div className="w-full space-y-12">
              {fields.map((field, index) => (
                <FormContainer
                  key={field.id}
                  {...{
                    expoId,
                    options: filteredSelectOptions,
                    formRemove: remove,
                    index,
                    register,
                    setValue,
                    control,
                  }}
                />
              ))}
              {hasPrivacyConsent && (
                <PrivacyConsentForm
                  placeholder="개인정보 동의 안내문을 입력해주세요"
                  registration={register('informationText', {
                    required: '개인정보 동의 안내문을 입력해주세요.',
                  })}
                  row={1}
                  value={watch('informationText')}
                  onRemove={handleRemovePrivacyConsent}
                />
              )}
            </div>
            <div className="flex gap-12">
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
              {!hasPrivacyConsent && (
                <CreateFormButton
                  onClick={handleAddPrivacyConsent}
                  text="개인정보 동의 안내문"
                />
              )}
            </div>
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
