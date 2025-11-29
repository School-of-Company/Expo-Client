'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UseFormRegister, UseFormSetValue, FieldValues } from 'react-hook-form';
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
}

export default function DropdownField({
  name,
  options,
  required = false,
  placeholder = '선택하세요',
  register,
  setValue,
}: DropdownFieldProps) {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [dropdownWidth, setDropdownWidth] = useState<number>(0);
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleOptionClick = (value: string) => {
    setSelectedOption(value);
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
        className="flex w-fit cursor-pointer items-center justify-between gap-16 rounded-sm border-1 border-solid border-gray-100 px-10 py-12"
        onClick={() => setIsOpen(!isOpen)}
      >
        <p className="text-h3r text-black">{selectedOption || placeholder}</p>
        {isOpen ? <ArrowUp /> : <ArrowDown />}
      </div>

      {isOpen && (
        <ul
          className="absolute z-10 mt-2 space-y-8 rounded-sm bg-white py-16 shadow-lg"
          style={{ width: dropdownWidth }}
        >
          {options.map((option) => (
            <li
              key={option.id}
              className="cursor-pointer px-10 py-2 text-gray-600 hover:text-main-600"
              onClick={() => handleOptionClick(option.id)}
            >
              {option.label}
            </li>
          ))}
        </ul>
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
