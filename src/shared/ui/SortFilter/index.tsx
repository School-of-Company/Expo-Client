'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp } from '@/shared/assets/icons';
import { OptionType } from '@/widgets/admin/model/types';

interface sortFilterProps {
  options: OptionType[];
  selectedOption: OptionType;
  setSelectedOption: (option: OptionType) => void;
}

const SortFilter = ({
  options,
  selectedOption,
  setSelectedOption,
}: sortFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (option: OptionType) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        className="whitespace-nowrap rounded-[10px] bg-main-600 px-[14px] py-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-[24px] text-caption1r text-white">
          {selectedOption.label}
          {isOpen ? <ArrowUp fill="#fff" /> : <ArrowDown fill="#fff" />}
        </div>
      </button>
      {isOpen && (
        <div className="top-45 absolute left-1/2 z-30 w-[100px] -translate-x-1/2 transform rounded-lg border-2 border-solid border-gray-200 bg-white px-8 py-3 text-body2b">
          {options.map((option) => (
            <div
              key={option.value}
              className="flex h-40 w-full cursor-pointer items-center justify-center rounded-sm py-8 text-body2b text-gray-500 hover:bg-main-500 hover:text-white"
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortFilter;
