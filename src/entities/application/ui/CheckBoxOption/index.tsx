'use client';

import { RegisterOptions, UseFormRegister } from 'react-hook-form';
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

  return (
    <>
      {options.map((option) => {
        const inputId = `${name}-${option.value}`;

        return (
          <div key={option.value} className="flex items-center gap-20">
            <input
              id={inputId}
              type="checkbox"
              value={option.label}
              className="h-16 w-16 accent-blue-500"
              {...register(name, getValidationRules())}
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
