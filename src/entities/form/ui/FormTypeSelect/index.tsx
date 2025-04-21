'use client';

import React, { useState, useEffect } from 'react';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { ArrowDown, ArrowUp } from '@/shared/assets/icons';
import { preventEvent } from '@/shared/model/preventEvent';
import { FormValues, Option } from '@/shared/types/form/create/type';

interface Props {
  options: Option[];
  selectedOption: Option | null;
  setSelectedOption: (option: Option) => void;
  register: UseFormRegister<FormValues>;
  index: number;
  setValue: UseFormSetValue<FormValues>;
}

const FormTypeSelect = ({
  options,
  selectedOption,
  setSelectedOption,
  register,
  index,
  setValue,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (selectedOption) {
      setValue(`questions.${index}.formType`, selectedOption.value);
    }
  }, [selectedOption, setValue, index]);

  return (
    <div className="relative w-[196px]">
      <input
        type="hidden"
        {...register(`questions.${index}.formType`)}
        value={selectedOption?.value || ''}
      />
      <button
        type="button"
        onClick={(e: React.MouseEvent) => {
          preventEvent(e);
          setIsOpen(!isOpen);
        }}
        className="flex w-full items-center justify-evenly rounded-md border-1 border-solid border-gray-100 bg-white px-12 py-10"
      >
        {selectedOption?.icon && (
          <span className="mr-2">
            {React.cloneElement(selectedOption.icon as React.ReactElement, {
              fill: '#909090',
            })}
          </span>
        )}
        <span className="text-h3r text-gray-500 mobile:text-caption2r">
          {selectedOption?.label}
        </span>

        {isOpen ? <ArrowUp fill="#909090" /> : <ArrowDown fill="#909090" />}
      </button>
      {isOpen && (
        <ul className="absolute z-30 mt-1 flex w-full flex-col items-center gap-22 rounded-md border-1 border-solid border-gray-100 bg-white px-16 py-30 shadow-lg">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={(e: React.MouseEvent) => {
                preventEvent(e);
                setSelectedOption(option);
                setValue(`questions.${index}.formType`, option.value);
                setIsOpen(false);
              }}
              className="group flex w-full cursor-pointer items-center gap-18 text-h3r text-gray-500 hover:text-main-600 mobile:text-caption2r"
            >
              <span className="mr-2">
                {React.cloneElement(option.icon as React.ReactElement, {
                  fill: 'currentColor',
                  className: 'group-hover:text-main-600',
                })}
              </span>
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FormTypeSelect;
