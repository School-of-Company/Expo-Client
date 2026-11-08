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
import { handleFormErrors, useLeaveConfirm } from '@/shared/model';
import { DynamicFormType, FormValues } from '@/shared/types/form/create/type';
import { Button, DetailHeaderEditable } from '@/shared/ui';
import {
  SYSTEM_FIELD_LABEL,
  SystemField,
  buildMissingSystemQuestions,
  createSystemQuestions,
  findMissingSystemFields,
  requiresSystemFields,
} from '../../model/systemQuestions';
import FormContainer from '../FormContainer';

const labelsOf = (fields: SystemField[]) =>
  fields.map((field) => SYSTEM_FIELD_LABEL[field]).join(', ');

const SPECIAL_FIELD_TITLES: Record<DynamicFormType, string> = {
  NAME: '이름',
  PHONE_NUMBER: '전화번호',
  TRAINING_ID: '연수자아이디',
  OCCUPATION: '직업',
  SCHOOL: '소속 학교',
};

const REGION_TITLE = '지역';

/** 메뉴에서 고르는 문항. 지역은 특수 필드(dynamicFormType)가 아니라 문항 타입(formType)이다. */
type AddableField = DynamicFormType | 'REGION';

const FormEditor = ({
  expoId,
  type,
  mode,
  defaultValues,
  onSubmit,
  isLoading,
  isSuccess,
  hideBack,
}: {
  expoId: string;
  type: 'STANDARD' | 'TRAINEE';
  mode: 'application' | 'survey';
  defaultValues?: FormValues;
  onSubmit: (data: FormValues) => void;
  isLoading: boolean;
  isSuccess: boolean;
  hideBack?: boolean;
}) => {
  // 일반 참가자 신청 폼은 신청 서버가 읽는 문항과 동의 안내문을 빼고 저장할 수 없다(#943)
  const enforceSystemFields = requiresSystemFields(type, mode);
  const {
    control,
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { isDirty },
  } = useForm<FormValues>({
    defaultValues: defaultValues || {
      questions: enforceSystemFields ? createSystemQuestions() : [],
      informationText: '',
    },
  });

  // 저장에 성공한 뒤에는 묻지 않는다
  useLeaveConfirm(isDirty && !isSuccess);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  // 새 일반 참가자 신청 폼은 안내문 칸을 처음부터 둔다
  const [hasPrivacyConsent, setHasPrivacyConsent] = useState(
    !!defaultValues?.informationText || (enforceSystemFields && !defaultValues),
  );

  const questions = watch('questions') ?? [];

  // 화면 위 안내에는 빠진 문항과, 안내문 칸 자체가 없는 경우만 보인다. 칸이 있는데 비어 있으면 그 칸의 필수 검사가 알린다
  const missingOnScreen = enforceSystemFields
    ? findMissingSystemFields({
        questions,
        informationText: hasPrivacyConsent ? '-' : '',
      })
    : [];

  const handleFormSubmit = (data: FormValues) => {
    const submitData = {
      ...data,
      informationText: hasPrivacyConsent ? data.informationText : '',
    };
    if (enforceSystemFields) {
      const missing = findMissingSystemFields(submitData);
      if (missing.length > 0) {
        toast.error(
          `${labelsOf(missing)} 항목이 없어 저장할 수 없습니다. 빠진 항목을 추가해 주세요.`,
        );
        return;
      }
    }
    onSubmit(submitData);
  };

  const handleAddMissingSystemFields = () => {
    const added = buildMissingSystemQuestions(questions);
    if (added.length > 0) append(added);
    if (!hasPrivacyConsent) handleAddPrivacyConsent();
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
  // 일반 참가자의 소속 학교는 직업이 교사·예비교사일 때만 보이는 문장형이다.
  const handleAddSpecialField = (fieldType: AddableField) => {
    if (fieldType === 'REGION') {
      append({
        id: crypto.randomUUID(),
        title: REGION_TITLE,
        formType: 'REGION',
        options: [],
        requiredStatus: false,
        otherJson: null,
        dynamicFormType: 'DEFAULT',
      });
      return;
    }

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

  const specialFieldOptions: { value: AddableField; label: string }[] =
    mode === 'survey'
      ? []
      : [
          ...(Object.keys(SPECIAL_FIELD_TITLES) as DynamicFormType[])
            .filter((value) => !(type === 'TRAINEE' && value === 'OCCUPATION'))
            .map((value) => ({ value, label: SPECIAL_FIELD_TITLES[value] })),
          { value: 'REGION', label: REGION_TITLE },
        ];

  const usedSpecialFieldTypes = new Set<string>(
    questions.map((q) => q.dynamicFormType ?? 'DEFAULT'),
  );
  if (type === 'STANDARD' && !occupationQuestion) {
    usedSpecialFieldTypes.add('SCHOOL');
  }
  // 지역은 폼에 하나만 둔다. 이미 있으면 메뉴에서 막는다.
  if (questions.some((q) => q.formType === 'REGION')) {
    usedSpecialFieldTypes.add('REGION');
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
            hideBack={hideBack}
            fallbackHref={`/admin/exhibition/detail/${expoId}`}
            heading={`${type === 'TRAINEE' ? '연수자' : '참가자'} ${
              mode === 'survey' ? '설문' : '신청 폼'
            } ${defaultValues ? '수정' : '만들기'}`}
          />
          {missingOnScreen.length > 0 && (
            <div
              role="alert"
              className="flex items-center justify-between gap-16 rounded-sm border-1 border-solid border-error bg-white px-20 py-16 mobile:flex-col mobile:items-stretch"
            >
              <p className="break-keep text-body2r text-error">
                이 폼으로는 신청이 거절될 수 있습니다.{' '}
                {labelsOf(missingOnScreen)} 항목을 추가해 주세요.
              </p>
              <button
                type="button"
                onClick={handleAddMissingSystemFields}
                className="flex-none rounded-sm bg-main-600 px-16 py-10 text-body2b text-white"
              >
                빠진 항목 추가
              </button>
            </div>
          )}
          <div className="space-y-12">
            <div className="w-full space-y-12">
              {fields.map((field, index) => (
                <FormContainer
                  key={field.id}
                  {...{
                    expoId,
                    type,
                    options: filteredSelectOptions,
                    formRemove: remove,
                    index,
                    register,
                    setValue,
                    control,
                    lockSystemFields: enforceSystemFields,
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
                  // 일반 참가자 신청 폼은 안내문을 지울 수 없다
                  onRemove={
                    enforceSystemFields ? undefined : handleRemovePrivacyConsent
                  }
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
          {isLoading
            ? '제출 중...'
            : isSuccess
              ? '완료됨'
              : defaultValues
                ? '수정하기'
                : '생성하기'}
        </Button>
      </div>
    </form>
  );
};

export default FormEditor;
