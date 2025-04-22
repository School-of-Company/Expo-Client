'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown } from '@/shared/assets/icons';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  value: string;
  onChange?: (value: string) => void;
}

const SelectUserType = ({ options, value, onChange }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | undefined>(
    options.find((option) => option.value === value) || options[0],
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    const newSelectedOption = options.find((option) => option.value === value);
    if (newSelectedOption) {
      setSelectedOption(newSelectedOption);
    }
  }, [value, options]);

  useEffect(() => {
    if (buttonRef.current) {
      setDropdownWidth(buttonRef.current.offsetWidth);
    }
  }, [selectedOption?.label]);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const handleOptionClick = (option: Option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onChange) onChange(option.value);
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        className="flex items-center gap-16 text-h2b text-black"
      >
        {selectedOption?.label}
        <ArrowDown />
      </button>
      {isOpen && (
        <div
          className="absolute top-9 z-30 space-y-12 rounded-sm bg-white p-8 shadow-md"
          style={{ width: dropdownWidth }}
        >
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className="flex w-full cursor-pointer items-center justify-center rounded-sm px-12 py-8 text-body2r text-gray-500 hover:bg-main-100 hover:text-main-600"
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
