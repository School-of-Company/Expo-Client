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
  PictureOption,
  RequiredToggle,
} from '@/entities/create-form';
import { preventEvent } from '@/shared/model/preventEvent';
import { FormValues, Option } from '@/shared/types/create-form/type';
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
  const [selectedOption, setSelectedOption] = useState<Option | null>(
    options[0] || null,
  );

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
    IMAGE: (
      <PictureOption
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
    <div className="flex w-full flex-col gap-6 rounded-sm border-1 border-solid border-gray-200 px-[32px] py-[18px]">
      <div className="flex w-full items-center justify-between">
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
      <div className="border-b-1 border-solid border-gray-100 py-6">
        {selectedOption?.value !== 'SENTENCE' ? (
          <AddItemButton
            onClick={(e: React.MouseEvent) => {
              preventEvent(e);
              append({ value: '' });
            }}
          />
        ) : null}
      </div>
      <div className="flex w-full items-center justify-end gap-6">
        {selectedOption?.value !== 'IMAGE' &&
        selectedOption?.value !== 'SENTENCE' ? (
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
    </div>
  );
};

export default FormContainer;
