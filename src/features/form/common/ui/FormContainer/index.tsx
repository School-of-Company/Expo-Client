'use client';

import React, { useEffect, useState } from 'react';
import {
  Control,
  useFieldArray,
  UseFormRegister,
  UseFormSetValue,
  useWatch,
} from 'react-hook-form';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import {
  CheckBoxOption,
  DeleteButton,
  DropDownOption,
  FormTitle,
  FormTypeSelect,
  RequiredToggle,
} from '@/entities/form';
import { fieldRegistry, type FieldValue } from '@/entities/form/registry';
import ConditionalSettings from '@/entities/form/ui/ConditionalSettings';
import { formatTime } from '@/features/exhibition/edit/model/formatDateTime';
import { parseSettings } from '@/features/form/common/model/formUtils';
import { getTrainingProgram } from '@/shared/api';
import {
  formatTrainingProgramOption,
  isTrainingProgramQuestion,
  preventEvent,
} from '@/shared/model';
import { FormValues, Option } from '@/shared/types/form/create/type';
import { AddItemButton } from '@/shared/ui';
import type {
  DynamicFormItem,
  FormType,
} from '@/shared/types/application/type';

interface Props {
  expoId: string;
  type: 'STANDARD' | 'TRAINEE';
  options: Option[];
  formRemove: (index: number) => void;
  index: number;
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  control: Control<FormValues>;
}

/** 편집기가 타입을 바꾸게 하지 않고 보존만 하는 문항. 선택지도 서버 고정값을 쓴다. */
const FIXED_TYPE_LABELS: Partial<Record<string, string>> = {
  REGION: '지역',
  COMPANION: '동행자',
};

/** 지역·동행자를 응답자 화면 그대로 보여준다. 입력값은 이 화면에만 있고 저장·전송하지 않는다. */
const FixedFieldPreview = ({
  formType,
  title,
  requiredStatus,
  otherJson,
}: {
  formType: FormType;
  title: string;
  requiredStatus: boolean;
  otherJson: string | null;
}) => {
  const { Renderer, defaultValue } = fieldRegistry[formType];
  const { maxSelection } = parseSettings(otherJson);
  const item: DynamicFormItem = {
    id: 0,
    title,
    formType,
    jsonData: {},
    requiredStatus,
    otherJson: { hasEtc: false, ...(maxSelection && { maxSelection }) },
  };
  const [value, setValue] = useState<FieldValue>(() => defaultValue(item));

  return (
    <div className="space-y-12 rounded-sm bg-gray-50 p-16">
      <p className="text-caption1b text-gray-500">
        미리보기 (입력해도 저장되거나 전송되지 않습니다)
      </p>
      <p className="text-body2b text-black">
        {title || '(제목 없음)'}
        {requiredStatus && <span className="text-error"> *</span>}
      </p>
      <Renderer
        item={item}
        value={value}
        etc=""
        onChange={setValue}
        onEtcChange={() => {}}
      />
    </div>
  );
};

const FormContainer = ({
  expoId,
  type,
  options,
  formRemove,
  index,
  register,
  setValue,
  control,
}: Props) => {
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(() => {
    const formType = control._formValues.questions[index].formType;
    return options.find((option) => option.value === formType) || null;
  });

  const questionTitle = useWatch({
    control,
    name: `questions.${index}.title`,
  });

  const formType = useWatch({
    control,
    name: `questions.${index}.formType`,
  });
  const requiredStatus = useWatch({
    control,
    name: `questions.${index}.requiredStatus`,
  });
  const otherJson = useWatch({
    control,
    name: `questions.${index}.otherJson`,
  });
  const fixedTypeLabel = FIXED_TYPE_LABELS[formType];

  const dynamicFormType = useWatch({
    control,
    name: `questions.${index}.dynamicFormType`,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${index}.options`,
  });

  const isTrainingProgram = isTrainingProgramQuestion(questionTitle);

  const isSpecialField = !!dynamicFormType && dynamicFormType !== 'DEFAULT';
  // 이름·전화번호는 신청 처리에 꼭 필요해서 필수로 고정한다.
  // 연수자 아이디는 연수자 폼에서만 고정하고, 일반 폼에서는 관리자가 필수 여부를 고른다.
  const isRequiredField =
    dynamicFormType === 'NAME' ||
    dynamicFormType === 'PHONE_NUMBER' ||
    (dynamicFormType === 'TRAINING_ID' && type === 'TRAINEE');
  const hasOptions =
    selectedOption?.value === 'DROPDOWN' ||
    selectedOption?.value === 'MULTIPLE';

  const componentMap: Record<string, JSX.Element | null> = {
    MULTIPLE: (
      <CheckBoxOption
        fields={fields}
        remove={remove}
        register={register}
        index={index}
        setValue={setValue}
        control={control}
      />
    ),
    DROPDOWN: (
      <DropDownOption
        fields={fields}
        remove={remove}
        register={register}
        index={index}
      />
    ),
  };

  const renderOptionComponent = () => {
    return selectedOption?.value
      ? componentMap[selectedOption.value] || null
      : null;
  };

  const handleLoadTrainingPrograms = async () => {
    if (!expoId) return;

    setIsLoadingPrograms(true);
    try {
      const programs = await getTrainingProgram(expoId);
      const currentOptions = control._formValues.questions[index].options || [];

      const newOptions = programs.map((program) => ({
        id: uuidv4(),
        value: formatTrainingProgramOption(
          formatTime(program.startedAt),
          formatTime(program.endedAt),
          program.title,
        ),
        label: program.id,
      }));

      setValue(`questions.${index}.options`, [
        ...currentOptions,
        ...newOptions,
      ]);

      toast.success(`${programs.length}개의 연수 프로그램을 불러왔습니다`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '연수 프로그램 불러오기 실패',
      );
    } finally {
      setIsLoadingPrograms(false);
    }
  };

  useEffect(() => {
    if (selectedOption && !hasOptions) {
      setValue(`questions.${index}.options`, []);
    }
  }, [selectedOption, hasOptions, index, setValue]);

  useEffect(() => {
    if (isRequiredField) {
      setValue(`questions.${index}.requiredStatus`, true);
    }
  }, [isRequiredField, index, setValue]);

  return (
    <div
      className={`flex w-full flex-col gap-20 rounded-sm border-1 border-solid border-gray-200 px-32 py-18`}
    >
      <div className="flex w-full items-center justify-between gap-16">
        <FormTitle register={register} index={index} />
        {fixedTypeLabel ? (
          <div className="flex w-[196px] items-center justify-center rounded-md border-1 border-solid border-gray-100 bg-gray-50 px-12 py-10">
            <input type="hidden" {...register(`questions.${index}.formType`)} />
            <span className="text-h3r text-gray-500 mobile:text-caption2r">
              {fixedTypeLabel}
            </span>
          </div>
        ) : (
          <FormTypeSelect
            options={options}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            register={register}
            index={index}
            setValue={setValue}
          />
        )}
      </div>
      {renderOptionComponent()}
      {fixedTypeLabel && (
        <FixedFieldPreview
          formType={formType as FormType}
          title={questionTitle}
          requiredStatus={requiredStatus}
          otherJson={otherJson}
        />
      )}
      <div className="flex items-center gap-12 border-b-1 border-solid border-gray-100">
        {hasOptions && dynamicFormType !== 'OCCUPATION' ? (
          <>
            <AddItemButton
              onClick={(e: React.MouseEvent) => {
                preventEvent(e);
                append({ id: uuidv4(), value: '' });
              }}
            />
            {isTrainingProgram && (
              <button
                type="button"
                onClick={(e: React.MouseEvent) => {
                  preventEvent(e);
                  handleLoadTrainingPrograms();
                }}
                disabled={isLoadingPrograms}
                className="flex h-40 items-center gap-8 px-16 py-8 text-body2r text-gray-500 underline transition-colors hover:text-main-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoadingPrograms
                  ? '불러오는 중...'
                  : '연수 프로그램 불러오기'}
              </button>
            )}
          </>
        ) : null}
      </div>
      <div className="flex w-full items-center justify-end gap-20">
        <DeleteButton
          onClick={(e: React.MouseEvent) => {
            preventEvent(e);
            formRemove(index);
          }}
        />
        <RequiredToggle
          control={control}
          index={index}
          isLocked={isRequiredField}
        />
      </div>

      {!isSpecialField && (
        <ConditionalSettings
          currentIndex={index}
          control={control}
          setValue={setValue}
        />
      )}
    </div>
  );
};

export default FormContainer;
