'use client';

import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { ApplicationFormValues } from '@/shared/types/application/type';
import EtcOption from '../EtcOption';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  register: UseFormRegister<ApplicationFormValues>;
  name: string;
  required: boolean;
  otherJson: string | null;
}

const MultipleOption = ({
  options,
  register,
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
        <EtcOption register={register} name={name} type="radio" />
      )}
    </>
  );
};

export default MultipleOption;
