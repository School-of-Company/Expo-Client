'use client';

import { useState } from 'react';
import { RegisterOptions, UseFormRegister } from 'react-hook-form';
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
  name: string;
  required: boolean;
  otherJson: string | null;
  maxSelection?: number | null;
}
const CheckBoxOption = ({
  options,
  register,
  name,
  required,
  otherJson,
  maxSelection,
}: Props) => {
  const [selectedValues, setSelectedValues] = useState<Set<string>>(() => {
    const initialSelected = new Set<string>();
    options.forEach((option) => {
      if (option.isAlwaysSelected) {
        initialSelected.add(option.label);
      }
    });
    return initialSelected;
  });

  const getValidationRules = (): RegisterOptions<
    ApplicationFormValues,
    string
  > => {
    const rules: RegisterOptions<ApplicationFormValues, string> = {};

    if (required) rules.required = '필수 옵션을 선택해주세요';

    if (maxSelection) {
      rules.validate = (value) => {
        const selectedCount = Array.isArray(value) ? value.length : 0;
        if (selectedCount > maxSelection) {
          return `최대 ${maxSelection}개까지만 선택할 수 있습니다`;
        }
        return true;
      };
    }

    return rules;
  };

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    optionLabel: string,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
  ) => {
    const isChecked = e.target.checked;

    setSelectedValues((prev) => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(optionLabel);
      } else {
        newSet.delete(optionLabel);
      }
      return newSet;
    });

    onChange(e);
  };

  const isMaxReached =
    maxSelection !== null &&
    maxSelection !== undefined &&
    selectedValues.size >= maxSelection;

  return (
    <>
      {options.map((option) => {
        const inputId = `${name}-${option.value}`;
        const isAlwaysSelected = option.isAlwaysSelected || false;

        const shouldDisable =
          isAlwaysSelected ||
          (isMaxReached && !selectedValues.has(option.label));

        const { onChange, ...registerRest } = register(
          name,
          getValidationRules(),
        );

        return (
          <div key={option.value} className="flex items-center gap-20">
            <input
              id={inputId}
              type="checkbox"
              value={option.label}
              defaultChecked={isAlwaysSelected}
              disabled={shouldDisable}
              className="h-16 w-16 accent-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              {...registerRest}
              onChange={(e) => handleCheckboxChange(e, option.label, onChange)}
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
};

export default CheckBoxOption;
