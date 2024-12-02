'use client';

import { useState } from 'react';
import { ArrowDown } from '@/shared/assets/icons';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  defaultValue?: string;
  onChange?: (value: string) => void;
}

const SelectUserType = ({ options, defaultValue, onChange }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | undefined>(
    options.find((option) => option.value === defaultValue) || options[0],
  );

  const toggleOpen = () => setIsOpen((prev) => !prev);
  const handleOptionClick = (option: Option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onChange) onChange(option.value);
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={toggleOpen}
        className="flex items-center gap-2 text-h4 text-black"
      >
        {selectedOption?.label}
        <ArrowDown />
      </button>
      {isOpen && (
        <div className="absolute top-9 z-30 w-[150px] rounded-sm bg-white p-2 shadow-md">
          {options.map((option) => (
            <button
              key={option.value}
              className="flex w-full cursor-pointer items-center justify-center py-2 text-caption2 text-gray-500 hover:bg-main-100"
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectUserType;
