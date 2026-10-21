'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
  FieldValues,
} from 'react-hook-form';
import { ArrowDown, ArrowUp } from '@/shared/assets/icons';

export interface Option {
  id: string;
  label: string;
  value: string;
}

interface DropdownFieldProps {
  name: string;
  options: Option[];
  required?: boolean;
  placeholder?: string;
  register: UseFormRegister<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
  watch: UseFormWatch<FieldValues>;
  /** 지금 고를 수 없는 선택지 값. 보이되 누를 수 없다 */
  disabledValues?: string[];
  /** 고를 수 없는 선택지가 있을 때 아래에 보이는 안내 */
  disabledNotice?: string;
}

export default function DropdownField({
  name,
  options,
  required = false,
  placeholder = '선택하세요',
  register,
  setValue,
  watch,
  disabledValues = [],
  disabledNotice,
}: DropdownFieldProps) {
  // 표시는 폼 값에서 읽는다. 따로 들고 있으면 이전 단계로 돌아오거나 조건부로 다시 나타날 때
  // 폼에는 값이 남아 있는데 "선택하세요"로 보인다
  const selectedOption = String(watch(name) ?? '');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [dropdownWidth, setDropdownWidth] = useState<number>(0);
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleOptionClick = (value: string) => {
    setIsOpen(false);
    setValue(name, value);
  };

  useEffect(() => {
    if (buttonRef.current) {
      setDropdownWidth(buttonRef.current.offsetWidth);
    }
  }, [selectedOption, isOpen]);

  return (
    <div className="relative w-full">
      <div
        ref={buttonRef}
        className="flex w-fit cursor-pointer items-center justify-between gap-16 rounded-sm border-1 border-solid border-gray-100 px-16 py-12 [&_svg]:h-16 [&_svg]:w-16"
        onClick={() => setIsOpen(!isOpen)}
      >
        <p className="text-body2r text-black">
          {/* 제출 값은 option.id, 화면에는 label 을 보여준다 */}
          {options.find((option) => option.id === selectedOption)?.label ||
            placeholder}
        </p>
        {isOpen ? <ArrowUp /> : <ArrowDown />}
      </div>

      {isOpen && (
        <ul
          className="absolute z-10 mt-2 space-y-8 rounded-sm bg-white py-16 shadow-lg"
          style={{ width: dropdownWidth }}
        >
          {options.map((option) => {
            const disabled = disabledValues.includes(option.id);
            return (
              <li
                key={option.id}
                aria-disabled={disabled || undefined}
                className={
                  disabled
                    ? 'cursor-not-allowed px-10 py-2 text-gray-300'
                    : 'cursor-pointer px-10 py-2 text-gray-600 hover:text-main-600'
                }
                onClick={() => !disabled && handleOptionClick(option.id)}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}

      {disabledNotice &&
        options.some((option) => disabledValues.includes(option.id)) && (
          <p className="mt-8 break-keep text-caption1r text-gray-500">
            {disabledNotice}
          </p>
        )}

      <input
        type="hidden"
        {...register(name, {
          required: required ? '필수 옵션을 선택해주세요' : false,
        })}
      />
    </div>
  );
}
