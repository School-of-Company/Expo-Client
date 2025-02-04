import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { ApplicationFormValues } from '@/shared/types/application/type';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  register: UseFormRegister<ApplicationFormValues>;
  name: string;
  required: boolean;
}

const DropDownOption = ({ options, register, name, required }: Props) => {
  return (
    <select
      className="rounded border px-2 py-1"
      {...register(name, {
        required: required ? '필수 옵션을 선택해주세요' : false,
      })}
    >
      <option value="">선택하세요</option>
      {options.map((option) => (
        <option key={option.value} value={option.label}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default DropDownOption;
