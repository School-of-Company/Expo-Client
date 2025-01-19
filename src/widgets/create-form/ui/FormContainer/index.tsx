'use client';

import React, { useState } from 'react';
import {
  Control,
  useFieldArray,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';
import {
  CheckBoxOption,
  DeleteButton,
  DropDownOption,
  FormTitle,
  FormTypeSelect,
  MultipleChoiceOption,
  PictureOption,
  RequiredToggle,
  TextOption,
} from '@/entities/create-form';
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
  const [selectedOption, setSelectedOption] = useState<Option | null>(
    options[0] || null,
  );

  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${index}.options`,
  });

  const componentMap: Record<string, JSX.Element | null> = {
    SENTENCE: (
      <TextOption
        fields={fields}
        remove={remove}
        register={register}
        index={index}
      />
    ),
    CHECKBOX: (
      <CheckBoxOption
        fields={fields}
        remove={remove}
        register={register}
        index={index}
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
    MULTIPLE: (
      <MultipleChoiceOption
        fields={fields}
        remove={remove}
        register={register}
        index={index}
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
        <AddItemButton onClick={() => append({ value: '' })} />
      </div>
      <div className="flex w-full items-center justify-end gap-6">
        <DeleteButton onClick={() => formRemove(index)} />
        <RequiredToggle />
      </div>
    </div>
  );
};

export default FormContainer;
