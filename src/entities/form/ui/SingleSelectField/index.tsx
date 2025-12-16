'use client';

import React from 'react';
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
  FieldValues,
} from 'react-hook-form';
import EtcField from '../EtcField';

export interface Option {
  id: string;
  label: string;
  value: string;
}

interface SingleSelectFieldProps {
  name: string;
  label: string;
  options: Option[];
  required?: boolean;
  allowEtc?: boolean;
  etcLabel?: string;
  register: UseFormRegister<FieldValues>;
  watch: UseFormWatch<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
}

export default function SingleSelectField({
  name,
  label: _label,
  options,
  required = false,
  allowEtc = false,
  etcLabel = '기타',
  register,
  watch,
  setValue,
}: SingleSelectFieldProps) {
  return (
    <>
      {options.map((option) => {
        const inputId = `${name}-${option.id}`;

        return (
          <div key={option.id} className="flex items-center gap-20">
            <input
              id={inputId}
              type="radio"
              value={option.id}
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
      {allowEtc && (
        <EtcField
          register={register}
          name={name}
          type="radio"
          watch={watch}
          setValue={setValue}
          label={etcLabel}
        />
      )}
    </>
  );
}
