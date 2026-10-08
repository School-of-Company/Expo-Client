'use client';

import React from 'react';
import {
  Control,
  FieldValues,
  UseFormRegister,
  get,
  useFieldArray,
  useFormState,
  useWatch,
} from 'react-hook-form';
import { Input } from '@/shared/ui';
import {
  COMPANION_MAX_COUNT,
  OCCUPATION_OPTIONS,
  Occupation,
  REGION_OPTIONS,
  SCHOOL_OCCUPATIONS,
} from '../../constants/occupationData';

interface CompanionFieldProps {
  name: string;
  label: string;
  required?: boolean;
  /** 추가할 수 있는 동행자 수. 대표자는 세지 않는다. */
  maxCount?: number;
  control: Control<FieldValues>;
  register: UseFormRegister<FieldValues>;
}

const EMPTY_COMPANION = { name: '', occupation: '', region: '', school: '' };

const selectClassName =
  'w-full rounded-sm border-1 border-solid border-gray-200 bg-white px-16 py-12 text-body2r text-black outline-none';

const ErrorText = ({ message }: { message?: string }) =>
  message ? <span className="text-caption1r text-error">{message}</span> : null;

/**
 * 동행자 입력(`COMPANION`). 대표자가 한 명씩 추가하고, 사람마다 이름·구분·지역을 받는다.
 * 소속은 구분이 `SCHOOL_OCCUPATIONS`일 때만 받는다(Form 동행자 검증과 같은 기준).
 */
export default function CompanionField({
  name,
  label,
  required = false,
  maxCount = COMPANION_MAX_COUNT,
  control,
  register,
}: CompanionFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
    rules: {
      validate: (value) =>
        !required ||
        (value?.length ?? 0) > 0 ||
        `${label}을(를) 1명 이상 추가해주세요`,
    },
  });
  const companions = useWatch({ control, name }) as
    | { occupation?: string }[]
    | undefined;
  const { errors } = useFormState({ control, name });
  const fieldError = (path: string) =>
    get(errors, `${name}.${path}`)?.message as string | undefined;

  return (
    <div className="flex flex-col gap-16">
      <p className="text-caption1r text-gray-500">
        대표자를 포함해 최대 {maxCount + 1}명까지 함께 신청할 수 있습니다.
        동행자는 대표자 번호로 등록되고 사람마다 QR을 받습니다.
      </p>

      {fields.map((field, index) => {
        const occupation = companions?.[index]?.occupation as Occupation;
        const needsSchool = SCHOOL_OCCUPATIONS.includes(occupation);
        return (
          <div
            key={field.id}
            className="flex flex-col gap-12 rounded-sm bg-gray-100 p-16"
          >
            <div className="flex items-center justify-between">
              <p className="text-body2b text-black">동행자 {index + 1}</p>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-caption1r text-gray-500"
              >
                삭제
              </button>
            </div>

            <Input
              {...register(`${name}.${index}.name`, {
                validate: (value: string) =>
                  value.trim() !== '' || '동행자 이름을 입력해주세요',
                maxLength: { value: 10, message: '이름은 10자 이하입니다' },
              })}
              placeholder="이름"
              error={!!fieldError(`${index}.name`)}
            />
            <ErrorText message={fieldError(`${index}.name`)} />

            <select
              {...register(`${name}.${index}.occupation`, {
                required: '구분을 선택해주세요',
              })}
              className={selectClassName}
            >
              <option value="">구분 선택</option>
              {OCCUPATION_OPTIONS.map(({ key, label: optionLabel }) => (
                <option key={key} value={key}>
                  {optionLabel}
                </option>
              ))}
            </select>
            <ErrorText message={fieldError(`${index}.occupation`)} />

            <select
              {...register(`${name}.${index}.region`, {
                required: '지역을 선택해주세요',
              })}
              className={selectClassName}
            >
              <option value="">지역 선택</option>
              {REGION_OPTIONS.map(({ key, label: optionLabel }) => (
                <option key={key} value={key}>
                  {optionLabel}
                </option>
              ))}
            </select>
            <ErrorText message={fieldError(`${index}.region`)} />

            {needsSchool && (
              <>
                <Input
                  {...register(`${name}.${index}.school`, {
                    validate: (value: string) =>
                      value.trim() !== '' || '소속을 입력해주세요',
                    maxLength: {
                      value: 100,
                      message: '소속은 100자 이하입니다',
                    },
                  })}
                  placeholder="소속 (예: 광주초)"
                  error={!!fieldError(`${index}.school`)}
                />
                <ErrorText message={fieldError(`${index}.school`)} />
              </>
            )}
          </div>
        );
      })}

      <button
        type="button"
        disabled={fields.length >= maxCount}
        onClick={() => append(EMPTY_COMPANION)}
        className="rounded-sm border-1 border-dashed border-gray-300 px-16 py-12 text-body2b text-gray-700 disabled:cursor-not-allowed disabled:text-gray-400"
      >
        {fields.length >= maxCount
          ? `동행자는 최대 ${maxCount}명입니다`
          : `+ 동행자 추가 (${fields.length}/${maxCount})`}
      </button>
      <ErrorText message={fieldError('root')} />
    </div>
  );
}
