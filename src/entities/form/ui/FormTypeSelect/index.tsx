'use client';

import { useState, useEffect } from 'react';
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
        className="flex w-full items-center justify-between rounded-md border-1 border-solid border-gray-100 bg-white px-3 py-[10px]"
      >
        <div className="flex items-center">
          {selectedOption?.icon && (
            <span className="mr-2">{selectedOption.icon}</span>
          )}
          <span className="text-h5 text-gray-500">{selectedOption?.label}</span>
        </div>
        {isOpen ? <ArrowUp fill="#909090" /> : <ArrowDown fill="#909090" />}
      </button>
      {isOpen && (
        <ul className="absolute z-30 mt-1 flex w-full flex-col items-center gap-[10px] rounded-md border-1 border-solid border-gray-100 bg-white py-[30px] shadow-lg">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={(e: React.MouseEvent) => {
                preventEvent(e);
                setSelectedOption(option);
                setValue(`questions.${index}.formType`, option.value);
                setIsOpen(false);
              }}
              className="flex w-full cursor-pointer items-center justify-center p-2 text-h5 text-gray-500 hover:bg-gray-100"
            >
              {option.icon && <span className="mr-2">{option.icon}</span>}
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FormTypeSelect;
