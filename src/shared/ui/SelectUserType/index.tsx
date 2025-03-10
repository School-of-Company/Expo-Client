'use client';

import React, { useState, useEffect } from 'react';
import { ArrowDown } from '@/shared/assets/icons';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  value: string;
  onChange?: (value: string) => void;
  setSearchText: (text: string) => void;
  setSearchInputText: (text: string) => void;
}

const SelectUserType = ({
  options,
  value,
  onChange,
  setSearchText,
  setSearchInputText,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | undefined>(
    options.find((option) => option.value === value) || options[0],
  );

  useEffect(() => {
    const newSelectedOption = options.find((option) => option.value === value);
    if (newSelectedOption) {
      setSelectedOption(newSelectedOption);
    }
  }, [value, options]);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const handleOptionClick = (option: Option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onChange) onChange(option.value);
    setSearchText('');
    setSearchInputText('');
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={toggleOpen}
        className="text-h4 flex items-center gap-2 text-black"
      >
        {selectedOption?.label}
        <ArrowDown />
      </button>
      {isOpen && (
        <div className="absolute top-9 z-30 w-[150px] rounded-sm bg-white p-2 shadow-md">
          {options.map((option) => (
            <button
              key={option.value}
              className="text-caption2 flex w-full cursor-pointer items-center justify-center py-2 text-gray-500 hover:bg-main-100"
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
