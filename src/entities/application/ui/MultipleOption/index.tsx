import React from 'react';
import { UseFormRegister, UseFormWatch } from 'react-hook-form';
import { ApplicationFormValues } from '@/shared/types/application/type';
import EtcOption from '../EtcOption';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  register: UseFormRegister<ApplicationFormValues>;
  watch: UseFormWatch<ApplicationFormValues>;
  name: string;
  required: boolean;
  otherJson: string | null;
}

const MultipleOption = ({
  options,
  register,
  watch,
  name,
  required,
  otherJson,
}: Props) => {
  return (
    <div>
      {options.map((option) => (
        <div key={option.value} className="flex items-center gap-[10px]">
          <input
            type="radio"
            value={option.label}
            className="h-4 w-4 accent-blue-500"
            {...register(name, {
              required: required ? '필수 옵션을 선택해주세요' : false,
            })}
          />
          <label className="text-body3 text-black">{option.label}</label>
        </div>
      ))}
      {otherJson !== null && (
        <EtcOption register={register} watch={watch} name={name} type="radio" />
      )}
    </div>
  );
};

export default MultipleOption;
