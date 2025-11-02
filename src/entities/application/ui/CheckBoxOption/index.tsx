'use client';

import { useEffect } from 'react';
import { Control, Controller, UseFormRegister } from 'react-hook-form';
import { ApplicationFormValues } from '@/shared/types/application/type';
import EtcOption from '../EtcOption';

interface Option {
  value: string;
  label: string;
  isAlwaysSelected?: boolean;
}

interface Props {
  options: Option[];
  register: UseFormRegister<ApplicationFormValues>;
  name: `${number}` | string;
  required: boolean;
  otherJson: string | null;
  maxSelection?: number | null;
  control: Control<ApplicationFormValues>;
}
const CheckBoxOption = ({
  options,
  register,
  name,
  required: _required,
  otherJson,
  maxSelection,
  control,
}: Props) => {
  const defaultValues = options
    .filter((opt) => opt.isAlwaysSelected)
    .map((opt) => opt.label);

  useEffect(() => {
    if (defaultValues.length > 0) {
      // setValue(name, defaultValues as string[]);
    }
  }, [defaultValues]);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValues}
      render={({ field }) => {
        const selectedValues = (field.value as string[]) || [];
        const isMaxReached =
          maxSelection !== null &&
          maxSelection !== undefined &&
          selectedValues.length >= maxSelection;

        const handleCheckboxChange = (
          optionLabel: string,
          isChecked: boolean,
        ) => {
          let newValues: string[];
          if (isChecked) {
            newValues = [...selectedValues, optionLabel];
          } else {
            newValues = selectedValues.filter((v) => v !== optionLabel);
          }
          field.onChange(newValues);
        };

        return (
          <>
            {options.map((option) => {
              const inputId = `${name}-${option.value}`;
              const isAlwaysSelected = option.isAlwaysSelected || false;
              const isChecked = selectedValues.includes(option.label);

              const shouldDisable =
                isAlwaysSelected || (isMaxReached && !isChecked);

              return (
                <div key={option.value} className="flex items-center gap-20">
                  <input
                    id={inputId}
                    type="checkbox"
                    value={option.label}
                    checked={isChecked}
                    disabled={shouldDisable}
                    className="h-16 w-16 accent-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                    onChange={(e) =>
                      handleCheckboxChange(option.label, e.target.checked)
                    }
                  />
                  <label
                    htmlFor={inputId}
                    className={`text-body2r ${shouldDisable ? 'text-gray-700' : 'cursor-pointer text-black'}`}
                  >
                    {option.label}
                    {isAlwaysSelected && (
                      <span className="ml-8 text-caption2r text-gray-500">
                        (기본값)
                      </span>
                    )}
                  </label>
                </div>
              );
            })}
            {otherJson !== null && (
              <EtcOption register={register} name={name} type="checkbox" />
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
};

export default CheckBoxOption;
