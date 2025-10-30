'use client';

import React, { useEffect, useState } from 'react';
import {
  Control,
  useFieldArray,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';
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
import { preventEvent } from '@/shared/model';
import { FormValues, Option } from '@/shared/types/form/create/type';
import { AddItemButton } from '@/shared/ui';

interface Props {
  options: Option[];
  formRemove: (index: number) => void;
  index: number;
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  control: Control<FormValues>;
}

const FormContainer = ({
  options,
  formRemove,
  index,
  register,
  setValue,
  control,
}: Props) => {
  const [isCheckBox, setIsCheckBox] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(() => {
    const formType = control._formValues.questions[index].formType;
    return options.find((option) => option.value === formType) || null;
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${index}.options`,
  });

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
      <div className="border-b-1 border-solid border-gray-100">
        {selectedOption?.value !== 'SENTENCE' ? (
          <AddItemButton
            onClick={(e: React.MouseEvent) => {
              preventEvent(e);
              append({ value: '' });
            }}
          />
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

      {(selectedOption?.value === 'MULTIPLE' ||
        selectedOption?.value === 'CHECKBOX') && (
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
