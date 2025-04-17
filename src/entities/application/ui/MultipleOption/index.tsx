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
    <>
      {options.map((option) => {
        const inputId = `${name}-${option.value}`;

        return (
          <div key={option.value} className="flex items-center gap-20">
            <input
              id={inputId}
              type="radio"
              value={option.label}
              className="h-16 w-16 accent-blue-500"
              {...register(name, {
                required: required ? '필수 옵션을 선택해주세요' : false,
              })}
            />
            <label
              htmlFor={inputId}
              className="cursor-pointer text-body2r text-black"
            >
              {option.label}
            </label>
          </div>
        );
      })}
      {otherJson !== null && (
        <EtcOption register={register} watch={watch} name={name} type="radio" />
      )}
    </>
  );
};

export default MultipleOption;
