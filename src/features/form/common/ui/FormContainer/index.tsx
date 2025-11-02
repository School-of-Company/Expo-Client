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
import {
  CheckBox,
  CheckBoxOption,
  DeleteButton,
  DropDownOption,
  FormTitle,
  FormTypeSelect,
  MultipleChoiceOption,
  RequiredToggle,
} from '@/entities/form';
import ConditionalSettings from '@/entities/form/ui/ConditionalSettings';
import { getTrainingProgram } from '@/shared/api';
import { preventEvent } from '@/shared/model';
import { FormValues, Option } from '@/shared/types/form/create/type';
import { AddItemButton } from '@/shared/ui';

interface Props {
  expoId: string;
  options: Option[];
  formRemove: (index: number) => void;
  index: number;
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  control: Control<FormValues>;
}

const FormContainer = ({
  expoId,
  options,
  formRemove,
  index,
  register,
  setValue,
  control,
}: Props) => {
  const [isCheckBox, setIsCheckBox] = useState(false);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(() => {
    const formType = control._formValues.questions[index].formType;
    return options.find((option) => option.value === formType) || null;
  });

  const questionTitle = useWatch({
    control,
    name: `questions.${index}.title`,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${index}.options`,
  });

  const isTrainingProgramQuestion =
    questionTitle?.includes('연수 프로그램을 선택해주세요');

  const componentMap: Record<string, JSX.Element | null> = {
    CHECKBOX: (
      <CheckBoxOption
        fields={fields}
        remove={remove}
        register={register}
        index={index}
        isCheckBox={isCheckBox}
      />
    ),
    DROPDOWN: (
      <DropDownOption
        fields={fields}
        remove={remove}
        register={register}
        index={index}
        isCheckBox={isCheckBox}
      />
    ),
    MULTIPLE: (
      <MultipleChoiceOption
        fields={fields}
        remove={remove}
        register={register}
        index={index}
        isCheckBox={isCheckBox}
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
        value: `${program.title} (${program.startedAt} ~ ${program.endedAt})`,
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
    if (selectedOption?.value === 'SENTENCE') {
      setValue(`questions.${index}.options`, []);
    }

    if (
      selectedOption?.value === 'SENTENCE' ||
      selectedOption?.value === 'IMAGE'
    ) {
      setIsCheckBox(false);
    }
  }, [selectedOption, index, setValue]);

  return (
    <div
      className={`flex w-full flex-col gap-20 rounded-sm border-1 border-solid border-gray-200 px-32 py-18`}
    >
      <div className="flex w-full items-center justify-between gap-16">
        <FormTitle register={register} index={index} />
        <FormTypeSelect
          options={options}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          register={register}
          index={index}
          setValue={setValue}
        />
      </div>
      {renderOptionComponent()}
      <div className="flex items-center gap-12 border-b-1 border-solid border-gray-100">
        {selectedOption?.value !== 'SENTENCE' ? (
          <>
            <AddItemButton
              onClick={(e: React.MouseEvent) => {
                preventEvent(e);
                append({ value: '' });
              }}
            />
            {isTrainingProgramQuestion && (
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
        {selectedOption?.value !== 'IMAGE' &&
        selectedOption?.value !== 'SENTENCE' &&
        selectedOption?.value !== 'DROPDOWN' ? (
          <CheckBox control={control} index={index} text="기타" />
        ) : null}
        <DeleteButton
          onClick={(e: React.MouseEvent) => {
            preventEvent(e);
            formRemove(index);
          }}
        />
        <RequiredToggle control={control} index={index} />
      </div>

      <ConditionalSettings
        currentIndex={index}
        control={control}
        setValue={setValue}
      />
    </div>
  );
};

export default FormContainer;
