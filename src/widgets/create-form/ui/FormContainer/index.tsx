'use client';

import React, { useState } from 'react';
import {
  CheckBoxOption,
  DeleteButton,
  FormTitle,
  FormTypeSelect,
  RequiredToggle,
  TextOption,
  DropDownOption,
  PictureOption,
  MultipleChoiceOption,
} from '@/entities/create-form';
import { Option } from '@/shared/types/create-form/type';
import { AddItemButton } from '@/shared/ui';

const FormContainer = ({ options }: { options: Option[] }) => {
  const [selectedOption, setSelectedOption] = useState<Option | null>(
    options[0] || null,
  );

  const componentMap: Record<string, JSX.Element | null> = {
    text: <TextOption />,
    checkbox: <CheckBoxOption />,
    dropdown: <DropDownOption />,
    'multiple-choice': <MultipleChoiceOption />,
    image: <PictureOption />,
  };

  const renderOptionComponent = () => {
    return selectedOption?.value
      ? componentMap[selectedOption.value] || null
      : null;
  };

  return (
    <div className="flex w-full flex-col gap-6 rounded-sm border-1 border-solid border-gray-200 px-[32px] py-[18px]">
      <div className="flex w-full items-center justify-between">
        <FormTitle />
        <FormTypeSelect
          options={options}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
        />
      </div>
      {renderOptionComponent()}
      <div className="border-b-1 border-solid border-gray-100 py-6">
        <AddItemButton />
      </div>
      <div className="flex w-full items-center justify-end gap-6">
        <DeleteButton />
        <RequiredToggle />
      </div>
    </div>
  );
};

export default FormContainer;
