'use client';

import React from 'react';
import {
  Control,
  Controller,
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

interface MultiSelectFieldProps {
  name: string;
  label: string;
  options: Option[];
  required?: boolean;
  maxSelection?: number;
  allowEtc?: boolean;
  etcLabel?: string;
  control: Control<FieldValues>;
  register: UseFormRegister<FieldValues>;
  watch: UseFormWatch<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
}

export default function MultiSelectField({
  name,
  options,
  required = false,
  maxSelection,
  allowEtc = false,
  etcLabel = '기타',
  control,
  register,
  watch,
  setValue,
}: MultiSelectFieldProps) {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={[]}
      rules={{
        required: required ? '필수 옵션을 선택해주세요' : false,
        validate: (value) => {
          if (maxSelection && value && value.length > maxSelection) {
            return `최대 ${maxSelection}개까지 선택 가능합니다`;
          }
          return true;
        },
      }}
      render={({ field }) => {
        const selectedValues = (field.value as string[]) || [];
        const isMaxReached =
          maxSelection !== undefined && selectedValues.length >= maxSelection;

        const handleCheckboxChange = (optionId: string, isChecked: boolean) => {
          let newValues: string[];
          if (isChecked) {
            newValues = [...selectedValues, optionId];
          } else {
            newValues = selectedValues.filter((v) => v !== optionId);
          }
          field.onChange(newValues);
        };

        return (
          <>
            {options.map((option) => {
              const inputId = `${name}-${option.id}`;
              const isChecked = selectedValues.includes(option.id);
              const shouldDisable = isMaxReached && !isChecked;

              return (
                <div key={option.id} className="flex items-center gap-20">
                  <input
                    id={inputId}
                    type="checkbox"
                    value={option.id}
                    checked={isChecked}
                    disabled={shouldDisable}
                    className="h-16 w-16 accent-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                    onChange={(e) =>
                      handleCheckboxChange(option.id, e.target.checked)
                    }
                  />
                  <label
                    htmlFor={inputId}
                    className={`text-body2r ${shouldDisable ? 'text-gray-700' : 'cursor-pointer text-black'}`}
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
                type="checkbox"
                watch={watch}
                setValue={setValue}
                label={etcLabel}
                onCheckboxChange={(isChecked) =>
                  handleCheckboxChange(etcLabel, isChecked)
                }
                selectedValues={selectedValues}
              />
            )}
            {maxSelection && (
              <p className="text-caption1r text-gray-500">
                * 최대 {maxSelection}개까지 선택 가능합니다
              </p>
            )}
          </>
        );
      }}
    />
  );
}
