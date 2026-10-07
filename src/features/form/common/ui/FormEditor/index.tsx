'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  CreateFormButton,
  OCCUPATION_OPTIONS,
  PrivacyConsentForm,
  SCHOOL_OCCUPATIONS,
  selectOptionData,
  SplitButton,
} from '@/entities/form';
import { handleFormErrors } from '@/shared/model';
import { DynamicFormType, FormValues } from '@/shared/types/form/create/type';
import { Button, DetailHeaderEditable } from '@/shared/ui';
import FormContainer from '../FormContainer';

const SPECIAL_FIELD_TITLES: Record<DynamicFormType, string> = {
  NAME: '이름',
  PHONE_NUMBER: '전화번호',
  TRAINING_ID: '연수자아이디',
  OCCUPATION: '직업',
  SCHOOL: '소속 학교',
};

const FormEditor = ({
  expoId,
  type,
  mode,
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

  const questions = watch('questions') ?? [];

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

  const handleAddDefaultField = () => {
    append({
      id: crypto.randomUUID(),
      title: '',
      formType: 'SENTENCE',
      options: [],
      requiredStatus: false,
      otherJson: null,
      dynamicFormType: 'DEFAULT',
    });
  };

  const occupationQuestion = questions.find(
    (q) => q.dynamicFormType === 'OCCUPATION',
  );

  // 직업·소속 학교는 Form 서비스가 모양을 검증한다: 직업은 키가 고정된 드롭다운,
  // 일반 참가자의 소속 학교는 직업이 학생·교직원·교사일 때만 보이는 문장형이다.
  const handleAddSpecialField = (fieldType: DynamicFormType) => {
    const base = {
      id: crypto.randomUUID(),
      title: SPECIAL_FIELD_TITLES[fieldType],
      formType: 'SENTENCE',
      options: [],
      requiredStatus: false,
      otherJson: null,
      dynamicFormType: fieldType,
    };

    if (fieldType === 'OCCUPATION') {
      append({
        ...base,
        formType: 'DROPDOWN',
        requiredStatus: true,
        options: OCCUPATION_OPTIONS.map(({ key, label }) => ({
          id: crypto.randomUUID(),
          key,
          value: label,
        })),
      });
      return;
    }

    if (fieldType === 'SCHOOL' && type === 'STANDARD' && occupationQuestion) {
      append({
        ...base,
        otherJson: JSON.stringify({
          conditional: {
            parentId: occupationQuestion.id,
            triggerValues: occupationQuestion.options
              .filter((o) =>
                SCHOOL_OCCUPATIONS.some((occupation) => occupation === o.key),
              )
              .map((o) => o.id),
          },
        }),
      });
      return;
    }

    append(base);
  };

  const specialFieldOptions =
    mode === 'survey'
      ? []
      : (Object.keys(SPECIAL_FIELD_TITLES) as DynamicFormType[])
          .filter((value) => !(type === 'TRAINEE' && value === 'OCCUPATION'))
          .map((value) => ({ value, label: SPECIAL_FIELD_TITLES[value] }));

  const usedSpecialFieldTypes = new Set<string>(
    questions.map((q) => q.dynamicFormType ?? 'DEFAULT'),
  );
  if (type === 'STANDARD' && !occupationQuestion) {
    usedSpecialFieldTypes.add('SCHOOL');
  }

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
              <SplitButton
                onDefaultClick={handleAddDefaultField}
                onSpecialFieldClick={handleAddSpecialField}
                specialFieldOptions={specialFieldOptions}
                disabledOptions={usedSpecialFieldTypes}
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
