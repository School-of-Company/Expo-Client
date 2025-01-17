import React from 'react';
import {
  CheckBoxOption,
  DeleteButton,
  FormTitle,
  FormTypeSelect,
  RequiredToggle,
} from '@/entities/create-form';
import { Option } from '@/shared/types/create-form/type';
import { AddItemButton } from '@/shared/ui';

const FormContainer = ({ options }: { options: Option[] }) => {
  return (
    <div className="flex w-full flex-col gap-6 rounded-sm border-1 border-solid border-gray-200 px-[32px] py-[18px]">
      <div className="flex w-full items-center justify-between">
        <FormTitle />
        <FormTypeSelect options={options} />
      </div>
      <CheckBoxOption />
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
